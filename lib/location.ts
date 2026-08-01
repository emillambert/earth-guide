export type Coordinates = {
  latitude: number;
  longitude: number;
};

export async function requestCoordinates(): Promise<Coordinates> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Location is not available in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.message || "Location permission was denied."));
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60_000,
      },
    );
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "EarthGuide/1.0 (portable field reference)",
    },
  });

  if (!response.ok) {
    return `Coordinates ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
  }

  const data = (await response.json()) as {
    name?: string;
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      state?: string;
      country?: string;
    };
  };

  const address = data.address;
  const locality =
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    data.name;

  if (locality && address?.country) {
    return `${locality}, ${address.country}`;
  }
  if (data.display_name) {
    return data.display_name.split(",").slice(0, 3).join(",").trim();
  }
  return `Coordinates ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}
