import chai from 'chai';
import { JsonSchemasX } from 'library/manager/azColumnTypes';
import { RawSchemas } from 'library/manager/azColumnTypes/jsonschemas/interfaces';

const { expect } = chai;

describe('JsonSchemasX Unit Test 01', () => {
  it('should normalize basic data types correctly', () => {
    const rawSchemas: RawSchemas = {
      models: {
        user: {
          columns: {
            id: {
              type: ['integer'],
              primaryKey: true,
            },
            username: {
              type: ['string', 128],
            },
            email: {
              type: ['string'],
            },
          },
        },
      },
    };

    const jx = new JsonSchemasX('public', rawSchemas);
    const err = jx.normalizeRawSchemas();
    expect(err).to.be.undefined;

    const metadata = jx.schemasMetadata.models.user;
    expect(metadata).to.exist;
    expect(metadata.columns.id.type).to.deep.equal(['integer']);
    expect(metadata.columns.username.type).to.deep.equal(['string', 128]);
    expect(metadata.columns.email.type).to.deep.equal(['string']);
  });

  it('should handle belongsTo association and automatically add foreign key columns', () => {
    const rawSchemas: RawSchemas = {
      models: {
        user: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            name: { type: ['string'] },
          },
        },
        profile: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            userId: {
              type: ['belongsTo', 'user', {
                foreignKey: 'user_id',
              }],
            },
          },
        },
      },
    };

    const jx = new JsonSchemasX('public', rawSchemas);
    let err = jx.normalizeRawSchemas();
    expect(err).to.be.undefined;

    err = jx.afterNormalizeRawSchemas();
    expect(err).to.be.undefined;

    // Check if user_id column was added to profile
    const profileColumns = jx.schemas.models.profile.columns;
    expect(profileColumns.user_id).to.exist;
    expect(profileColumns.user_id.type).to.deep.equal(['integer']);
    expect(profileColumns.user_id.ammReferences).to.exist;
    expect(profileColumns.user_id.ammReferences.model).to.equal('user');
    expect(profileColumns.user_id.ammReferences.key).to.equal('id');
  });

  it('should handle hasMany association', () => {
    const rawSchemas: RawSchemas = {
      models: {
        user: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            userGroups: {
              type: ['hasMany', 'userGroup', {
                foreignKey: 'user_id',
              }],
            },
          },
        },
        userGroup: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            name: { type: ['string'] },
          },
        },
      },
    };

    const jx = new JsonSchemasX('public', rawSchemas);
    jx.parseRawSchemas();

    const userMetadata = jx.schemasMetadata.models.user;
    const userGroupsCol = userMetadata.columns.userGroups;
    // For hasMany, it doesn't have a columnNameInDb in the current table
    expect(userGroupsCol.type[0]).to.equal('hasMany');
    expect(userGroupsCol.columnNameInDb).to.be.undefined;
  });

  it('should handle belongsToMany association with through table', () => {
    const rawSchemas: RawSchemas = {
      models: {
        user: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            groups: {
              type: ['belongsToMany', 'group', {
                through: 'userGroup',
                foreignKey: 'user_id',
                otherKey: 'group_id',
                ammTargetAs: 'users',
                ammTargetOptions: {
                  through: 'userGroup',
                  foreignKey: 'group_id',
                  otherKey: 'user_id',
                },
              }],
            },
          },
        },
        group: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            name: { type: ['string'] },
          },
        },
      },
      associationModels: {
        userGroup: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
          },
        },
      },
    };

    const jx = new JsonSchemasX('public', rawSchemas);
    const err = jx.parseRawSchemas();
    expect(err).to.be.undefined;

    // Check metadata for through table columns
    const throughMetadata = jx.schemasMetadata.associationModels.userGroup;
    expect(throughMetadata.columns.user_id).to.exist;
    expect(throughMetadata.columns.group_id).to.exist;
    expect(throughMetadata.columns.user_id.isForeignKey).to.be.true;
    expect(throughMetadata.columns.group_id.isForeignKey).to.be.true;
  });
});
