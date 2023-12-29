import "reflect-metadata"
import { expect } from "chai"
import { DataSource } from "../../src/data-source/DataSource"
import { Post } from "../../sample/sample1-simple-entity/entity/Post"
import {
    closeTestingConnections,
    reloadTestingDatabases,
    setupTestingConnections,
    createTestingConnectionsFromDataSourceOptions,
} from "../utils/test-utils"
import { DataSourceOptions } from "../../src"

// function asyncSuite(name: string, setupSuite: () => Promise<Suite>) {
//     suite(`Async dummy Suite for ${name}`, function () {
//         let suite: Suite

//         suiteSetup(async () => (suite = await setupSuite()))

//         test(`Async tests for ${name} loaded`, async function () {
//             assert.ok(suite.suites.length || suite.tests.length)
//         })
//     })
// }

describe("integration", function () {
    let dataSourceOptionsList: DataSourceOptions[] = setupTestingConnections({
        entities: [Post],
    })

    if (dataSourceOptionsList.length < 1) {
        throw new Error("No database connection found to run integration tests")
    }

    for (const dataSourceOptions of dataSourceOptionsList) {
        describe(`${dataSourceOptions.name}`, () => {
            let newPost: Post

            let connection: DataSource

            before(async () => {
                ;[connection] = await createTestingConnectionsFromDataSourceOptions([
                    dataSourceOptions,
                ])
            })

            beforeEach(async () => {
                await reloadTestingDatabases([connection])
                newPost = new Post()
                newPost.text = "Hello post"
                newPost.title = "this is post title"
                newPost.likesCount = 0
            })

            after(() => closeTestingConnections([connection]))

            it("create: should return the same post", async () => {
                const postRepository = connection.getRepository(Post)
                const savedPost = await postRepository.save(newPost)

                savedPost.should.be.equal(newPost, connection.name)
            })

            it("create: should return post with an id", async () => {
                const postRepository = connection.getRepository(Post)
                const savedPost = await postRepository.save(newPost)

                expect(savedPost.id, connection.name).not.to.be.undefined
            })

            it("read: should return content of original post", async () => {
                const postRepository = connection.getRepository(Post)
                const savedPost = await postRepository.save(newPost)
                const insertedPost = await postRepository.findOneBy({
                    id: savedPost.id,
                })
                newPost.id = savedPost.id

                insertedPost!.should.be.eql(newPost, connection.name)
            })
        })
    }
})
