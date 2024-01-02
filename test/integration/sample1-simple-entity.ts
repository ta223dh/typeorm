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
import { DataSourceOptions, Repository } from "../../src"

describe("integration - > simple entity", function () {
    let dataSourceOptionsList: DataSourceOptions[] = setupTestingConnections({
        entities: [Post],
    })

    it('dataSourceOptionsList should have at least one database config', () => {
        expect(dataSourceOptionsList.length >= 1).to.be.true
    })

    for (const dataSourceOptions of dataSourceOptionsList) {
        describe(`${dataSourceOptions.name}`, () => {
            let newPost: Post

            let connection: DataSource

            let postRepository : Repository<Post>

            let savedPost: Post

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

                postRepository = connection.getRepository(Post)
                savedPost = await postRepository.save(newPost)
            })

            after(() => closeTestingConnections([connection]))

            it("create: should return the same post", async () => {
                savedPost.should.be.equal(newPost)
            })

            it("create: should return post with an id", async () => {
                expect(savedPost.id).not.to.be.undefined
            })

            it("read: should return content of original post", async () => {
                const insertedPost = await postRepository.findOneBy({
                    id: savedPost.id,
                })
                newPost.id = savedPost.id

                insertedPost!.should.be.eql(newPost)
            })
        })
    }
})

