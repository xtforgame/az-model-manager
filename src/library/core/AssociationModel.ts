import AmmModel from './AmmModel';

export default class AssociationModel extends AmmModel {
  constructor(ammOrm, modelName, tableDefine, tablePrefix : string = 'mn_') {
    super(ammOrm, modelName, tableDefine, tablePrefix);
  }
}
