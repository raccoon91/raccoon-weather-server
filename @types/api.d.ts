interface IWeatherHourResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      pageNo: number;
      numOfRows: number;
      totalCount: number;
      items: {
        item: {
          tm: string;
          rnum: string;
          stnId: string;
          stnNm: string;
          ta: string;
          taQcflg: string;
          rn: string;
          rnQcflg: string;
          ws: string;
          wsQcflg: string;
          wd: string;
          wdQcflg: string;
          hm: string;
          hmQcflg: string;
          pv: string;
          td: string;
          pa: string;
          paQcflg: string;
          ps: string;
          psQcflg: string;
          ss: string;
          ssQcflg: string;
          icsr: string;
          dsnw: string;
          hr3Fhsc: string;
          dc10Tca: string;
          dc10LmcsCa: string;
          clfmAbbrCd: string;
          lcsCh: string;
          vs: string;
          gndSttCd: string;
          dmstMtphNo: string;
          ts: string;
          tsQcflg: string;
          m005Te: string;
          m01Te: string;
          m02Te: string;
          m03Te: string;
        }[];
      };
    };
  };
}
