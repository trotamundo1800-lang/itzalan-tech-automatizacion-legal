import { featureModules } from '../feature-data';
import { FeatureShell } from '../feature-shell';
import { ContractsForm } from './contracts-form';

export default function ContratosPage() {
  return (
    <FeatureShell module={featureModules.contratos}>
      <ContractsForm />
    </FeatureShell>
  );
}