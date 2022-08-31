import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const res = `{
      "objectId": 988,
      "title": "API-54: Question about bulk APIs",
      "link": "http://example.com/2",
      "created": "2016-08-04",
      "priority": "HIGH",
      "project": "API",
      "reported_by": "ksmith@hubspot.com",
      "description": "Customer is not able to find documentation about our bulk Contacts APIs.",
      "reporter_type": "Support Rep",
      "status": "Resolved",
      "ticket_type": "Bug",
      "updated": "2016-09-23"
     }`;

    return JSON.stringify(res);
  }
}
