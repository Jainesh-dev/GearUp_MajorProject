const API_URL = "http://127.0.0.1:8000";

export async function getHelmetData(helmetId: string) {
  const response = await fetch(
    `${API_URL}/api/helmets/${helmetId}/latest`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch helmet ${helmetId}`);
  }

  return response.json();
}