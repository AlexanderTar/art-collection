import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ArtCertificateModule = buildModule("ArtCertificate", (m) => {
  const artCertificate = m.contract("ArtCertificate");

  return { artCertificate };
});

export default ArtCertificateModule;
