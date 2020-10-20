import AmmModel from './AmmModel';

export default class AssociationModel extends AmmModel {
  constructor(ammOrm, modelName, tableDefine) {
    super(ammOrm, modelName, tableDefine, 'mn_');
  }
}
