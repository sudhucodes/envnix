import { defineDocstraConfig } from 'docstra/mdx';

export default defineDocstraConfig({
    collections: {
        docs: 'content/docs',
    },
    editOnGithub: {
        repo: 'test',
        owner: 'sudhucodes',
        path: 'content/docs',
        branch: 'main',
    },
    feedback: {
        enabled: true,
        formSyncFormID: '<form-sync-form-id>',
    },
    navbar: {
        logo: {
            link: '/',
            src: '/logo.svg',
            alt: 'Logo',
            className: 'h-8 w-auto',
        },
        links: [
            { name: 'Guides', href: '/docs/guides' },
            { name: 'Examples', href: '/docs/examples' },
        ],
    },
});
