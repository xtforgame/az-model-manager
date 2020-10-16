import sequelize from 'sequelize';
import AmmOrm, { Schemas } from 'library/core';
import AzModelManager from 'library/manager';
import getTestSchema from 'library/manager/getTestSchema';

const getModelDefs04 : () => Schemas | Error = () => {
  console.log('AzModelManager :', AzModelManager);
  return AzModelManager.parseSchema(getTestSchema());
};

export {
  getModelDefs04,
};
