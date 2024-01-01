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

describe("integration - > simple entity", function () {
    let dataSourceOptionsList: DataSourceOptions[] = setupTestingConnections({
        entities: [Post],
    })

    it('runs for any database', () => {
        expect(dataSourceOptionsList.length >= 1).to.be.true
    })

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
