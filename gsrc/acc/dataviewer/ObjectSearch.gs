package acc.dataviewer
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.entity.IEntityType


class ObjectSearch {
  
  private var _objectType : IEntityType

  construct(objectType : IEntityType) {
    _objectType = objectType
  }
  
  
  public function search(criteria : ObjectSearchCriteria) : IQueryBeanResult<KeyableBean> {
    
    var q = Query.make(_objectType) as Query<KeyableBean>
    
    if (criteria.Id != null) {
      q.compare("ID", Equals, new Key(_objectType, criteria.Id))
    }
    
    if (criteria.WithRetired and _objectType.Retireable) {
      q.withFindRetired(true) 
    }
    //q.withLogSQL(true)
    var result = q.select()

    return result
  }

}