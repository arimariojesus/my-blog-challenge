/* eslint-disable consistent-return */
import { useEffect } from 'react';

const REPO_NAME = 'arimariojesus/my-blog-challenge';

export const useUtterances = (commentNodeId: string): any => {
  useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId);

    if (!scriptParentNode) return;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', REPO_NAME);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :spech_balloon:');
    script.setAttribute('theme', 'preferred-color-scheme');
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild as Node);
    };
  }, [commentNodeId]);
};
