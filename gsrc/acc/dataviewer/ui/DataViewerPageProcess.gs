package acc.dataviewer.ui
uses acc.dataviewer.ObjectTypeProvider
uses gw.api.database.IQueryBeanResult
uses acc.dataviewer.ObjectSearch
uses gw.entity.IEntityType
uses java.util.Date
uses acc.dataviewer.ObjectSearchCriteria
uses acc.dataviewer.SortedFields
uses java.util.ArrayList
uses gw.lang.reflect.IPropertyInfo
uses gw.api.tree.RowTreeRootNode
uses java.lang.Integer
uses java.lang.StringBuilder
uses java.lang.ClassNotFoundException
uses gw.api.util.DisplayableException


class DataViewerPageProcess {
  
  private var _typeProvider : ObjectTypeProvider as readonly TypeProvider
  private var _objectSearch : ObjectSearch
  private var _fields : SortedFields as readonly Fields
  private var _fieldToPromote : String as FieldToPromote


  public property get FieldsCount() : int {
    return (_fields != null ? _fields.FieldsCount : 0)
  }


  public function createSearchCriteria() : ObjectSearchCriteria {
   
    var criteria = new ObjectSearchCriteria()
    criteria.SortByField = "ID"
    criteria.SortAscending = false
    
    return criteria
  }
  

  public function search(criteria : ObjectSearchCriteria) : IQueryBeanResult<KeyableBean> {
 
    try {
      _typeProvider = new ObjectTypeProvider(criteria.ObjectName)
    }
    catch (e : ClassNotFoundException) {
      throw new DisplayableException("Object ${criteria.ObjectName} cannot be found.") 
    }
    
    _fields = new SortedFields(_typeProvider)
    _objectSearch = new ObjectSearch(_typeProvider.ObjectType)

    return _objectSearch.search(criteria) 
  }


  public function getFieldValue(bean : KeyableBean, position : int) : Object {
 
    var field = _fields?.getField(position)
    if (field == null) {
      return null
    }  
    
    if (ObjectTypeProvider.isArray(field)) {
      return (bean[field.Name] as KeyableBean[])*.ID.toList()
    }
    else if (field.FeatureType typeis IEntityType) {
      var keyBean = bean[field.Name] as KeyableBean 
      if (keyBean != null) {
        return keyBean.ID
      }
      else {
        return null
      }
    }
    else if (field.FeatureType typeis Date) {
      return (bean[field.Name] as Date)
    }
    else {
      return bean[field.Name]
    }
  }
  
  
  public function getForeignFields(bean : KeyableBean) : List<IPropertyInfo> {
    var fieldsMap = new ArrayList<IPropertyInfo>()
    
    _fields.SortedFields?.each(\ f -> {
      if (f.FeatureType typeis IEntityType and bean[f.Name] != null) {
        fieldsMap.add(f)
      }
      else if (ObjectTypeProvider.isArray(f) and (bean[f.Name] as KeyableBean[]).HasElements) {
        fieldsMap.add(f)
      }
    })
    
    return fieldsMap
  }


  public function getTreeRoot(bean : KeyableBean, foreignFields : List<IPropertyInfo>) : RowTreeRootNode {
    print("!!! invoke getTreeRoot")
    var rootBlock(r : Object) : List<Object>
        = \r -> {
      var rr = r typeis IPropertyInfo
          ? (r.FeatureType typeis IEntityType ? {bean[r.Name]}  as List<Object>
              : bean[r.Name] as List<Object>)
          : new ArrayList<Object>()
      print("!!! ${r} = ${rr}")
      return rr as List<Object>}

    return new RowTreeRootNode(foreignFields, rootBlock, 1)
  }


  public function getForeignBeans(bean : KeyableBean, field : IPropertyInfo) : List<KeyableBean> {
    return field.FeatureType typeis IEntityType ? {bean[field.Name] as KeyableBean} : bean[field.Name] as List<KeyableBean>
  }


  public function hideFields(positions : Integer[]) {
    var shift = 0
    positions.each(\ i -> {
      _fields.hideField(i-shift)
      shift++
    })
  }


  public function moveFieldsFirst(positions : Integer[]) {
    var shift = 0
    positions.sortDescending().each(\ i -> {
      _fields.moveFieldFirst(i+shift)
      shift++
    })
  }


  public function moveFieldsLast(positions : Integer[]) {
    var shift = 0
    positions.sort().each(\ i -> {
      _fields.moveFieldLast(i-shift)
      shift++
    })
  }


  public function moveFieldsBck(positions : Integer[]) {
    positions.sort().each(\ i -> {
      _fields.moveFieldBy(i, -1)
    })
  }


  public function moveFieldsFwd(positions : Integer[]) {
    positions.sortDescending().each(\ i -> {
      _fields.moveFieldBy(i, 1)
    })
  }
  

  public function getToolTip(position : int) : String {
    
    if (_fields.isFieldTypekey(position)) {
      return getTypekeyValues(_fields.getField(position))
    }
    else {
      return "" 
    }
  }
  
  
  //----------------------------------
  //      PRIVATE
  
  
  private function getTypekeyValues(prop : IPropertyInfo) : String {
    
    var sb = new StringBuilder()
    
    var typelist = (prop.FeatureType as gw.entity.ITypeList)
    typelist.getTypeKeys(true).each(\ k -> {
      sb.append("${k.Retired ? "X" : " "} ${k.Code} ${k.DisplayName}\n")
    })
    
    return sb.toString()
  }
}
