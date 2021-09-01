process.env.NODE_ENV = "test"
const db = require("../db");
const app = require("../app");
const request = require('supertest');

let newBook;
beforeEach(async function () {
    await db.query(`DELETE From books`);
    const result = await db.query(`INSERT INTO books 
    (isbn, amazon_url, author, language, pages,publisher,title,year) VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        ["123456", "http://a.co/eobPtX2", "Matthew Lane", "English", 250, "Princeton University Press",
            "Power-Up: Unlocking the Hidden Mathematics in Video Games", 2017]);

    newBook = result.rows[0];
})

afterEach(async function () {
    await db.query(`DELETE From books`);
})

describe("GET / get all books", function () {

    test("Get all books", async () => {
        const result = await request(app).get('/books');
        const books = result.body.books;
        expect(result.statusCode).toBe(200);
        expect(books[0]).toHaveProperty("isbn");
    });

    test("Get book by Id /:isbn", async () => {

        const result = await request(app).get(`/books/${newBook.isbn}`);
        expect(result.statusCode).toBe(200);
        const book = result.body.book.isbn;
        expect(book).toEqual(newBook.isbn);
    })

    test("GET 404 for not found isbn /:isbn", async () => {

        const res = await request(app).get('/books/12458');
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /", () => {

    test("Should add a new Book", async () => {

        const result = await request(app).post('/books').send(
            {
                "books": {
                    "isbn": "011111",
                    "amazon_url": "http://a.co/eobPtX2as",
                    "author": "J.K.rowelling",
                    "language": "english",
                    "pages": 300,
                    "publisher": "Princeton University Press",
                    "title": "Harry Potter: The Sorcerers stone",
                    "year": 1997
                }
            }
        );
        expect(result.statusCode).toBe(201);
        expect(result.body.book.isbn).toEqual(expect.any(String));
    })

    test("Should return the 404 if jsonSchema is not valid", async () => {

        const res = await request(app).post('/books').send(
            {
                "books": {
                    "isbn": "011111",
                    "amazon_url": "http://a.co/eobPtX2as",
                    "author": "J.K.rowelling",
                    "language": "english",
                    "publisher": "Princeton University Press",
                    "title": "Harry Potter: The Sorcerers stone",
                    "year": 1997
                }
            }
        );
        expect(res.statusCode).toBe(404);
    })
})

describe('DELETE a book /:isbn', () => {

    test("Should delete a book ", async () => {

        const res = await request(app).delete(`/books/${newBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted" })
    })
})

afterAll(async function () {
    await db.end();
})
