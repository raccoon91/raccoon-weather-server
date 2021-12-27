interface IASOSDailyInfo {
  tm: string;
  avgTa: string;
  minTa: string;
  maxTa: string;
  sumRn: string;
  avgWs: string;
  avgRhm: string;
}

interface IASOSDailyInfoResponse {
  response: {
    body: {
      items: {
        item: IASOSDailyInfo[];
      };
    };
  };
}
