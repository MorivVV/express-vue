import express from 'express';
import cors from 'cors';
// import socketIO from "socket.io";
import pool from './db';
import createField from './db/function/createSQLQuery';
import bodyParser from 'body-parser';

export default (app, http) => {
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(cors())
    app.get('/foo', (req, res) => {
        pool.query(`SELECT id, name, kod, date_beg, date_end, active, descript, "number"
    FROM public.test_table`, [])
            .then(({ rows }) => {
                console.log(rows);
                res.send(rows);
            })
    });

    app.post('/tables', (req, res) => {

        pool.query(`select *
        from information_schema.columns 
        where table_schema='public'`, [])
            .then(({ rows }) => {
                console.log(rows);
                res.json(rows);
            })

    });

    app.post('/bar', (req, res) => {

        pool.query(`SELECT * FROM public.pg_types_fields
    ORDER BY id ASC `, [])
            .then(({ rows }) => {
                console.log(rows);
                res.json(rows);
            })

    });

    app.post('/create', (req, res) => {
        let fields = req.body.fields;
        let CreateText = "";
        if (fields.length > 0) {
            pool.query(`SELECT * FROM public.pg_types_fields
    ORDER BY id ASC `, [])
                .then(({ rows }) => {
                    let pg_types_fields = rows
                    console.log(pg_types_fields)
                    fields.forEach(element => {
                        if (CreateText !== "") {
                            CreateText += ", \n"
                        }
                        let pgtype = pg_types_fields.filter(e => e.id === +element.ftype).map(e => e.type_name)[0]
                        CreateText += createField(element.fname, pgtype, element.scale, element.fnull, element.default)
                    });
                    console.log(CreateText)
                    res.send(CreateText)
                })
        }


    })

    app.use(express.static('dist'))
        // optional support
        // for socket.io

    // let io = socketIO(http);
    // io.on("connection", client => {
    //   client.on("message", function(data) {
    //     // do something
    //   });
    //   client.emit("message", "Welcome");
    // });
}