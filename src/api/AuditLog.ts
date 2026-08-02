import Api from './Api'

class AuditLogApi extends Api {
  protected resource = 'audit-logs'

  public async list<T>(options = {}) {
    return this.get<T>(options)
  }
}

export default AuditLogApi
