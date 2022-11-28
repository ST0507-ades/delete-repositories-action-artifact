require('dotenv').config();
const { Octokit } = require('octokit');

const owner = 'st0507-ades';
const repositoryPrefix = 'ades-ay2223s2-class';

async function deleteArtifacts(owner, repo) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_PAT,
    });

    const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts', { owner, repo });
    console.log(`Deleting ${response.data.total_count} from ${repo}`);
    const deleteResponse = await Promise.all(
        response.data.artifacts
            .map((artifact) => artifact.id)
            .map((artifactId) =>
                octokit.request('DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}', {
                    owner,
                    repo,
                    artifact_id: artifactId,
                }),
            ),
    );
    console.log(`Deleted ${deleteResponse.filter(({ status }) => status === 204).length} from ${repo}`);
}

async function getAllRepositoriesWithPrefix(prefix, owner) {
    const octokit = new Octokit({
        auth: process.env.GITHUB_PAT,
    });

    const result = await octokit.request('GET /search/repositories{?q,page}', {
        q: `${prefix} in:name org:${owner}`,
    });

    return result.data.items.map(({ name }) => name).sort();
}

async function main() {
    const repositories = await getAllRepositoriesWithPrefix(repositoryPrefix, owner);
    for (let i = 0; i < repositories.length; i++) {
        const repository = repositories[i];
        await deleteArtifacts(owner, repository);
    }
}

main();
