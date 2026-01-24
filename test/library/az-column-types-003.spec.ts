import chai from 'chai';
import fs from 'fs';
import { JsonSchemasX } from 'library/manager/azColumnTypes';
import getSchemas from 'library/manager/getTestSchema2';

const { expect } = chai;

describe('JsonSchemasX Investigation with getTestSchema2', () => {
  it('should have pgCollections in campaign schemasMetadata', () => {
    const rawSchemas = getSchemas();
    const jx = new JsonSchemasX('public', rawSchemas);
    jx.toCoreSchemas();

    // Check in schemas
    const campaignSchema = jx.schemas.models.campaign;
    expect(campaignSchema.columns.pgCollections, 'pgCollections must exist in campaign schema').to.exist;
    expect((campaignSchema.columns.pgCollections as any).type[0]).to.equal('hasMany');

    // Check in schemasMetadata
    const campaignMetadata = jx.schemasMetadata.models.campaign;
    const campaignAllMetadata = jx.schemasMetadata.allModels.campaign;

    const campaignCol = jx.schemas.models.campaign.columns.pgCollections as any;
    fs.writeFileSync('schemas.json', JSON.stringify(jx.schemas.models.campaign, null, 2));
    fs.writeFileSync('schemasMetadata.json', JSON.stringify(campaignMetadata, null, 2));
    

    // console.log('Metadata Object Identity:', campaignMetadata === campaignAllMetadata);
    // console.log('Campaign Metadata Columns:', Object.keys(campaignMetadata.columns));

    expect(campaignMetadata, 'campaign metadata in models should exist').to.exist;
    expect(campaignMetadata.columns.pgCollections, 'pgCollections must exist in campaign models metadata').to.exist;
    expect(campaignAllMetadata.columns.pgCollections, 'pgCollections must exist in campaign allModels metadata').to.exist;
  });

  it('should have children in pgCollection schemasMetadata (self-reference)', () => {
    const rawSchemas = getSchemas();
    const jx = new JsonSchemasX('public', rawSchemas);
    const err = jx.parseRawSchemas();
    expect(err).to.be.undefined;

    const pgCollectionMetadata = jx.schemasMetadata.models.pgCollection;
    expect(pgCollectionMetadata.columns.children, 'children must exist in pgCollection metadata').to.exist;
    expect((pgCollectionMetadata.columns.children as any).type[0]).to.equal('hasMany');
  });

  it('should have through table columns in associationModels metadata', () => {
    const rawSchemas = getSchemas();
    const jx = new JsonSchemasX('public', rawSchemas);
    const err = jx.parseRawSchemas();
    expect(err).to.be.undefined;

    // user.userGroups is belongsToMany through userUserGroup
    const userUserGroupMetadata = jx.schemasMetadata.associationModels.userUserGroup;
    expect(userUserGroupMetadata, 'userUserGroup metadata should exist').to.exist;
    
    // Check for columns added to through table
    expect(userUserGroupMetadata.columns.user_id, 'user_id must exist in userUserGroup metadata').to.exist;
    expect(userUserGroupMetadata.columns.group_id, 'group_id must exist in userUserGroup metadata').to.exist;
  });
});
