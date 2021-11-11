import { RedisClient } from 'redis'
import { promisify } from 'util'
import { EntityDataMapperContract, IRepository } from '../..'
import { IItemListModel } from '../../Entities'
import { DataNotFound } from '../../Entities/Domain/Exceptions/DataNotFound'
import { RedisManyRecordsFoundException } from '../../Entities/Domain/Exceptions/RedisManyRecordsFoundException'
import { RedisCollection } from '../../Entities/Domain/RedisCollection'

export abstract class RedisClientRepositoryContract<TDomainValue, TDaoValue = TDomainValue>
  implements IRepository<RedisCollection<TDomainValue>>
{
  protected deleteKey
  protected getKeys
  protected getKeyValue
  protected setKey

  constructor(
    protected readonly repository: RedisClient,
    protected readonly dataMapper: EntityDataMapperContract<TDomainValue, TDaoValue>,
    protected accountId: string | null,
    protected dataNotFoundException?: DataNotFound
  ) {
    if (!dataNotFoundException) this.dataNotFoundException = new DataNotFound()

    this.deleteKey = promisify(this.repository.del).bind(this.repository)
    this.getKeys = promisify(this.repository.keys).bind(this.repository)
    this.getKeyValue = promisify(this.repository.get).bind(this.repository)
    this.setKey = promisify(this.repository.set).bind(this.repository)
  }

  async getAll<TFilter>(
    filter: TFilter,
    prefix?: string
  ): Promise<IItemListModel<RedisCollection<TDomainValue>>> {
    const keyPrefix = prefix ?? this.getKeyPrefix()

    const result = await this.getKeys(`${keyPrefix}${filter}`)

    return {
      items: result.map(item => new RedisCollection(item)) || [],
      total: result?.length || 0
    }
  }

  async findAll<TFilter>(
    filter: TFilter,
    prefix?: string
  ): Promise<RedisCollection<TDomainValue>[]> {
    const keyPrefix = prefix ?? this.getKeyPrefix()

    return (
      (await this.getKeys(`${keyPrefix}${filter}`)).map(item => new RedisCollection(item)) || []
    )
  }

  async getOneById(id: string): Promise<RedisCollection<TDomainValue>> {
    const result = await this.findAll(`*${id}*`, '')

    if (!result?.length) throw this.dataNotFoundException

    if (result.length > 1) throw new RedisManyRecordsFoundException(`*${id}*`)

    const key = result[0]

    const value = this.dataMapper.toDomain(JSON.parse(await this.getKeyValue(key.getKey())))

    return key.setValue(value)
  }

  async delete(id: string | {}): Promise<boolean> {
    try {
      const redisKeys = await this.findAll(id, '')

      await Promise.all(redisKeys.map(async redis => this.deleteKey(redis.getKey())))

      return true
    } catch (error) {
      return false
    }
  }

  async create(entity: RedisCollection<TDomainValue>): Promise<RedisCollection<TDomainValue>> {
    await this.setKey(
      `${this.getKeyPrefix()}.${entity.getKey()}`,
      JSON.stringify(this.dataMapper.toDaoEntity(entity.getValue())),
      'EX',
      this.getSecondsToExpire(entity.getExpirationDate())
    )

    return entity
  }

  async save(entity: RedisCollection<TDomainValue>): Promise<RedisCollection<TDomainValue>> {
    return this.create(entity)
  }

  async createOrUpdate(entity: RedisCollection<TDomainValue>): Promise<void> {
    await this.create(entity)
  }

  async update(
    entity: RedisCollection<TDomainValue>
  ): Promise<boolean | RedisCollection<TDomainValue>> {
    return await this.create(entity)
  }

  public setAccountId(accountId: string): this {
    this.accountId = accountId
    return this
  }

  protected getSecondsToExpire(expirationDate?: Date): number {
    if (!!expirationDate) {
      const localDate = new Date(
        new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      )
      const secondsToExpire = (expirationDate.getTime() - localDate.getTime()) / 1000

      return Math.min(secondsToExpire, this.getDefaultExpirationInSeconds())
    }

    return this.getDefaultExpirationInSeconds()
  }

  protected getDefaultExpirationInSeconds(): number {
    return 60 * 60 * 6 // 6 hours
  }

  protected abstract getKeyPrefix(): string
}
