import { ZodIssue } from 'zod';
import { findBestMatch } from 'string-similarity';
type Issue =
  | ZodIssue
  | {
      code: 'unknown-command';
      command: string;
      availables: string[];
    };

export function errorHandler(issues: Issue[]) {
  const issue = issues[0];

  if (issue.code === 'unknown-command') {
    const match = findBestMatch(issue.command, issue.availables).bestMatch;
    console.warn(`\n'${issue.command}' is not a command. See '--help'.\n`);
    if (match.rating > 0.4) {
      console.warn(`The most similar command is:\n\t${match.target}`);
    }

    return false;
  }

  console.warn('\n' + issue.message);

  return false;
}
