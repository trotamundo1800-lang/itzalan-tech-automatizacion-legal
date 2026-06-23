import { featureModules } from '../feature-data';
import { FeatureShell } from '../feature-shell';
import { IaJuridicaPanel } from './ia-juridica-panel';

export default function IaJuridicaPage() {
  return (
    <FeatureShell module={featureModules.analisis}>
      <IaJuridicaPanel />
    </FeatureShell>
  );
}
