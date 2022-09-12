import type { NextApiRequest, NextApiResponse } from 'next';
import * as Retraced from 'retraced';
import requestIp from 'request-ip';

import env from '@lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getViewerToken(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get A viewer token and send it to the client, the client will use this token to initialize the logs-viewer
const getViewerToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id: projectId, groupId, token } = req.query;

  const retraced = new Retraced.Client({
    apiKey: token as string,
    projectId: projectId as string,
    endpoint: env.retraced.apiHost,
  });
  const reqIp = requestIp.getClientIp(req);
  const ip = reqIp == '::1' ? '127.0.0.1' : reqIp;

  retraced.reportEvent({
    crud: 'r',
    action: 'audit.log.view',
    description: 'Admin UI accessed the audit logs.',
    created: new Date(),
    actor: {
      id: 'Admin-UI',
      name: 'Admin-UI',
    },
    group: {
      id: groupId as string,
      name: groupId as string,
    },
    sourceIp: ip,
  });

  const viewerToken = await retraced.getViewerToken(groupId as string, '', true);

  return res.status(200).json({
    data: {
      viewerToken,
    },
    error: null,
  });
};
