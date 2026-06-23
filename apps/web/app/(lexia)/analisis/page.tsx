import { featureModules } from '../feature-data';
import { FeatureShell } from '../feature-shell';
import { IaJuridicaPanel } from '../ia-juridica/ia-juridica-panel';

export default function AnalisisPage() {
  return (
    <FeatureShell module={featureModules['ia-juridica']}>
      <IaJuridicaPanel />
    </FeatureShell>
  );
}