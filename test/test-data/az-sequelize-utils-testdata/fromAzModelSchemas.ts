import sequelize from 'sequelize';
import AmmOrm, { AmmSchemas } from 'library/core';
import AzModelManager, { JsonSchemasX } from 'library/manager';
import getTestSchema from 'library/manager/getTestSchema';
import getTestSchema2 from 'library/manager/getTestSchema2';

const getModelDefs04 : () => AmmSchemas | Error = () => {
  const jsonSchemasX = new JsonSchemasX('public', <any>getTestSchema());
  return jsonSchemasX.toCoreSchemas();
};

const getModelDefs05 : () => AmmSchemas | Error = () => {
  const jsonSchemasX = new JsonSchemasX('public', <any>getTestSchema2());
  return jsonSchemasX.toCoreSchemas();
};

export {
  getModelDefs04,
  getModelDefs05,
};
