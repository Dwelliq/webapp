declare module "@mapbox/mapbox-gl-geocoder" {
  class MapboxGeocoder {
    constructor(options: {
      accessToken: string;
      placeholder?: string;
      countries?: string;
      proximity?: [number, number];
      types?: string;
    });
    addTo(container: HTMLElement): void;
    on(event: string, callback: (e: any) => void): void;
    remove(): void;
  }
  export default MapboxGeocoder;
}

