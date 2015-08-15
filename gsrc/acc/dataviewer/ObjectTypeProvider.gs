package acc.dataviewer
uses gw.lang.reflect.IPropertyInfo
uses gw.lang.reflect.TypeSystem
uses gw.entity.IEntityType
uses gw.entity.IQueryablePropertyInfo


class ObjectTypeProvider {
  
  private var _objectName : String as readonly ObjectName
  private var _objectType : IEntityType as readonly ObjectType

  construct(name : String) {
    _objectName = name
    determineType()
  }
  
  
  public property get DBFields() : IPropertyInfo[] {    
    var props = _objectType.TypeInfo.Properties.where(\ p -> p typeis IQueryablePropertyInfo)
    return props.toTypedArray()
  }
  
  
  public property get IsRetireable() : boolean {
    return _objectType.Retireable
  }
  

  public static function isArray(prop : IPropertyInfo) : boolean {
    return prop.FeatureType.Array
  }
  
  
  public static function isTypekey(prop : IPropertyInfo) : boolean {
    return prop.FeatureType.Enum
  }
  
  
  
  public static function printProperty(prop : IPropertyInfo) {
    print("--- ${prop} -------------------------")
    print("Abstract: ${prop.Abstract}")
    print("FeatureType: ${prop.FeatureType}")
    print("Final: ${prop.Final}")
    print("Hidden: ${prop.Hidden}")
    print("Internal: ${prop.Internal}")
    print("Private: ${prop.Private}")
    print("Protected: ${prop.Protected}")
    print("Public: ${prop.Public}")
    print("Readable: ${prop.Readable}")
    print("Scriptable: ${prop.Scriptable}")
    print("Writable: ${prop.Writable}")
    print("OwnersType: ${prop.OwnersType}")
    print("IsArray: ${ObjectTypeProvider.isArray(prop)}")
    print("IsTypekey: ${ObjectTypeProvider.isTypekey(prop)}")
    print("\n")
  }
  
  
  //---------------------
  //    PRIVATE
  
  
  private function determineType() {
    _objectType = TypeSystem.getByRelativeName(_objectName) as IEntityType 
  }

}
