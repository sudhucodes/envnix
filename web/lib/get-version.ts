export async function getVersion() {
    const res = await fetch('https://registry.npmjs.org/envnix');

    if (!res.ok) {
        throw new Error('Failed to fetch package');
    }

    const data = await res.json();
    return data['dist-tags'].latest;
}
