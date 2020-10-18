import sequelize from 'sequelize';
import AmmOrm, { Schemas } from 'library/core';
import AzModelManager, { JsonSchemasX } from 'library/manager';
import getTestSchema from 'library/manager/getTestSchema';

const getModelDefs04 : () => Schemas | Error = () => {
  const jsonSchemasX = new JsonSchemasX(<any>getTestSchema());
  return jsonSchemasX.parseSchema();
};

export {
  getModelDefs04,
};
