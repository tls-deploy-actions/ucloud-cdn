const { Client } = require("@ucloud-sdks/ucloud-sdk-js");
const core = require("@actions/core");
const fs = require("fs");

const input = {
  publicKey: core.getInput("public-key"),
  privateKey: core.getInput("private-key"),
  fullchainFile: fs.readFileSync(core.getInput("fullchain-file")).toString(),
  keyFile: fs.readFileSync(core.getInput("key-file")).toString(),
  cdnDomainsId: core.getInput("cdn-domains-id"),
  projectId: core.getInput("project-id"),
  areacode: core.getInput("areacode") || 'cn',
};

async function main() {
  // Initalize client
  const client = new Client({
    config: {
      region: "cn-bj2",
      projectId: input.projectId || "",
    },
    credential: {
      publicKey: input.publicKey,
      privateKey: input.privateKey,
    },
  });

  // Create certificate
  const splited = input.fullchainFile.split(`-----BEGIN `).filter((item) => !!item.trim().length).map((item) => `-----BEGIN ${item}`.trim());
  const UserCert = splited.shift();
  const CaCert = splited.join(`\n`);
  const CertName = 'ghactions-' + new Date().getTime();

  await client.ucdn().addCertificate({
    CertName,
    UserCert,
    CaCert,
    PrivateKey: input.keyFile.trim(),
  });

  const Areacode = input.areacode;

  const domainsId = Array.from(
    new Set(input.cdnDomainsId.split(/\s+/).filter((x) => x))
  );

  const { DomainList } = await client.ucdn().getUcdnDomainConfig({
    'DomainId': domainsId,
  });

  for (const domainConfig of DomainList) {
    const { Domain, DomainId } = domainConfig.Domain;
    const { CertList } = await client.ucdn().getCertificateBaseInfoList({Domain});
    const matches = CertList.filter(item => item.CertType === 'ucdn' && item.CertName === CertName);
    if (!matches.length) {
      throw new Error('Certificate not found');
    }

    const { CertId } = matches[0];
    console.log(`Deploying certificate to CDN domain (${DomainId}) ${Domain}.`);
    await client.ucdn().updateUcdnDomainHttpsConfig({
      HttpsStatus: `enable`,
      CertType: `ucdn`,
      Areacode,
      DomainId,
      CertName,
      CertId,
    });
  }
}

main().catch((e) => {
  throw e;
});
