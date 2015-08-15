package acc.dataviewer
uses java.lang.Long
uses java.io.Serializable

class ObjectSearchCriteria implements Serializable {

  private var _id : Long as Id
  private var _objectName : String as ObjectName
  private var _withRetired : boolean as WithRetired = false
  
  private var _sortByField : String as SortByField
  private var _sortAscending : boolean as SortAscending
}
