import chai from 'chai';
import fs from 'fs';
import { JsonSchemasX } from 'library/manager/azColumnTypes';
import { RawSchemas } from 'library/manager/azColumnTypes/jsonschemas/interfaces';

const { expect } = chai;

describe('JsonSchemasX Bug Reproduction 01', () => {
  it('should have reverse association in schemasMetadata after parseRawSchemas', () => {
    const rawSchemas: RawSchemas = {
      models: {
        campaign: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            name: { type: ['string'] },
          },
        },
        pgCollectionCampaign: {
          columns: {
            id: { type: ['integer'], primaryKey: true },
            campaign: {
              type: ['belongsTo', 'campaign', {
                foreignKey: 'campaign_id',
                ammTargetAs: 'pgCollections',
                ammTargetHasMany: true,
              }],
            },
          },
        },
      },
    };

    const jx = new JsonSchemasX('public', rawSchemas);
    const err = jx.parseRawSchemas();
    expect(err).to.be.undefined;

    // The user said it is in schemas.models.campaign
    const campaignCol = jx.schemas.models.campaign.columns.pgCollections as any;
    fs.writeFileSync('schemas.json', JSON.stringify(jx.schemas.models.campaign, null, 2));
    expect(campaignCol).to.exist;
    expect(campaignCol.type[0]).to.equal('hasMany');

    // But missing in schemasMetadata.models.campaign
    // Reproduction: this should FAIL if the bug exists (it will be undefined)
    const campaignMetadata = jx.schemasMetadata.models.campaign;
    fs.writeFileSync('schemasMetadata.json', JSON.stringify(campaignMetadata, null, 2));
    expect(campaignMetadata.columns.pgCollections, 'pgCollections should exist in schemasMetadata').to.exist;
  });
});
