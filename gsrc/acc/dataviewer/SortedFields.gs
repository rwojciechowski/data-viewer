package acc.dataviewer
uses gw.lang.reflect.IPropertyInfo
uses java.util.ArrayList
uses java.lang.IllegalArgumentException
uses java.lang.Math
uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.Map
uses java.util.HashMap


class SortedFields {

  private var _typeProvider : ObjectTypeProvider
  
  private var _sortedFields : List<IPropertyInfo> as readonly SortedFields
  private var _fieldsCnt : int as readonly FieldsCount = 0
  

  construct(typeProvider : ObjectTypeProvider) {
    _typeProvider = typeProvider
    _sortedFields = initFieldList(typeProvider.DBFields)
    _fieldsCnt = _sortedFields.Count
  }


  public function getField(position : int) : IPropertyInfo {
    if (position >= _fieldsCnt) {
      return null
    }
    else {
      return _sortedFields[position]
    }
  }


  public function getFieldName(position : int) : String {
    if (position >= _fieldsCnt) {
      return null
    }
    else {
      return _sortedFields[position].Name
    }
  }
  
  
  public function getOrderedFieldNames() : String[] {
    return _sortedFields*.Name.orderBy(\ s -> s).toTypedArray()
  }


  public function getFieldValue(bean : KeyableBean, position : int) : Object {
    if (position >= _fieldsCnt) {
      return null
    }
    else {
      return bean[_sortedFields[position].Name]
    }
  }
  
  
  public function isFieldVisible(position : int) : boolean {
    if (position >= _fieldsCnt) {
      return false
    }
    else {
      return true
    }
  }
  
  public function isFieldTypekey(position : int) : boolean {
    if (position >= _fieldsCnt) {
      return false
    }
    else {
      return ObjectTypeProvider.isTypekey(_sortedFields[position])
    }
  }
  
  
  public function hideField(position : int) {
    if (position >= _fieldsCnt) {
      throw new IllegalStateException("Invalid field position: ${position}")
    }
    _sortedFields.remove(position)
    _fieldsCnt--
  }
  
  
  public function makeAllFieldsVisible() {
    _sortedFields = initFieldList(_typeProvider.DBFields)
    _fieldsCnt = _sortedFields.Count
  }
  
  
  public function moveFieldFirst(from : int) {
    if (from >= _fieldsCnt or from < 0) {
      throw new IllegalArgumentException("Field's position (${from}) is invalid.")
    }
    if (not canMove(from, -1)) {
      return
    }
    
    moveField(from, 1-from) // move to position 1
  }


  public function moveFieldFirst(name : String) {
    var field = _sortedFields.firstWhere(\ f -> f.Name == name)
    if (field == null) {
      throw new IllegalArgumentException("Field's name (${name}) is invalid.")
    }
    moveFieldFirst(_sortedFields.indexOf(field))
  }
  
  
  public function moveFieldLast(from : int) {
    if (from >= _fieldsCnt or from < 0) {
      throw new IllegalArgumentException("Field's position (${from}) is invalid.")
    }
    if (not canMove(from, 1)) {
      return
    }
    
    moveField(from, _fieldsCnt-1-from)
  }
  
  
  public function moveFieldBy(from : int, shift : int) {
    if (from >= _fieldsCnt or from < 0) {
      throw new IllegalArgumentException("Field's position (${from}) is invalid.")
    }
    if (not canMove(from, shift)) {
      return
    }
    
    if (shift > 0) {
      moveField(from, Math.min(shift, _fieldsCnt-1-from)) 
    }
    else {
      moveField(from, Math.max(shift, 1-from)) 
    }
  }
  
  
  private function initFieldList(fields : IPropertyInfo[]) : List<IPropertyInfo> {
    var sortFields = new ArrayList<IPropertyInfo>()
    // ID is always first
    sortFields.add(fields.firstWhere(\ f -> f.Name == "ID"))
    sortFields.addAll(fields.where(\ f -> f.Name != "ID").orderBy(\ f -> f.Name))
    return sortFields
  }
  
  
  private function moveField(from : int, shift : int) {
    var field = _sortedFields.remove(from)
    _sortedFields.add(from+shift, field)
  }
  
  private function canMove(from : int, shift : int) : boolean {
    if (shift == 0 
         or (shift < 0 and from <= 1) 
         or (shift > 0 and from == _fieldsCnt-1)) {
      return false
    }
    else {
      return true 
    }
  }
}
