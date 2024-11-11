import prismaClient from '../src/utils/prismaClient'

async function main() {
    await prismaClient.post.create({
        data: {
            title: 'Validation Library with Typescript',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Typescript' },
                        where: { name: 'Typescript' },
                    },
                    {
                        create: { name: 'Node JS' },
                        where: { name: 'Node JS' },
                    },
                    {
                        create: { name: 'React' },
                        where: { name: 'React' },
                    },
                    {
                        create: { name: 'Next JS' },
                        where: { name: 'Next JS' },
                    },
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                    {
                        create: { name: 'Validation' },
                        where: { name: 'Validation' },
                    },
                ]
            },
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'False Checks Table for Javascript: Are you doing it right?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: '.Net' },
                        where: { name: '.Net' },
                    },
                    {
                        create: { name: 'c#' },
                        where: { name: 'c#' },
                    },
                    {
                        create: { name: 'HTML' },
                        where: { name: 'HTML' },
                    },
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Javascript' },
                        where: { name: 'Javascript' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Customizable React Zoom Controller',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'React' },
                        where: { name: 'React' },
                    },
                    {
                        create: { name: 'Next JS' },
                        where: { name: 'Next JS' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Getting started to Vue js',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Vue JS' },
                        where: { name: 'Vue JS' },
                    },
                    {
                        create: { name: 'Frontend' },
                        where: { name: 'Frontend' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'All you need to know about Next js',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                    {
                        create: { name: 'Validation' },
                        where: { name: 'Validation' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Express js and Typescript',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'What is new on C#',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'c#' },
                        where: { name: 'c#' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Game development with Unity',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'HTML' },
                        where: { name: 'HTML' },
                    },
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Javascript' },
                        where: { name: 'Javascript' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'How to get a job?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Macbook or windows pc?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Cell Phone Prices on 2024',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: {name: 'Unity'},
                        where: {name: 'Unity'}
                    }
                ]
            }
        }
    })
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
        process.exit(1)
    })