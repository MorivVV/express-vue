const createField = (name_field, type_field, size_field = "", default_field = null, null_field = false) => {
        name_field = name_field.trim()
        if (default_field) {
            default_field = ' DEFAULT ' + default_field;
        } else {
            default_field = ""
        }

        let nn = ""
        if (null_field) {
            nn = " NOT NULL"
        }
        if (size_field) {
            size_field = `(${size_field})`
        } else {
            size_field = ''
        }
        return `"${name_field}" ${type_field}${size_field}${nn}${default_field}`
    }
    // name character varying(50) NOT NULL,
    // descript character varying NOT NULL DEFAULT '',
    // date_beg timestamp without time zone DEFAULT CURRENT_TIMESTAMP,

export default createField