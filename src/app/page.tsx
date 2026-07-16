import { PreferenceCatalogue } from "@/components/preference-catalogue";
import { getPreferenceData } from "@/lib/get-preference-data";

export default async function Home() {
  const data = await getPreferenceData();
  return <PreferenceCatalogue initialData={data} />;
}
