module.exports = {
    
////////////////////////////////////////////////////////////////////////////////

select_table_data: 
    
    async function () {
   
        let filter = this.w2ui_filter ()
        
        let [portion, start] = filter.LIMIT

        let {id_table} = this.rq
        
        let pk = (await this.db.get ({columns: {
        	'id LIKE': id_table + '.%',
        	is_pk: 1,
        }})).name

        let sql = 'SELECT * FROM ' + id_table

        if (pk) sql += ' ORDER BY ' + pk

		sql += ` LIMIT ${start}, ${portion}`

        let [all, cnt] = await Promise.all ([

			this.db_o.select_all (sql),

			this.db_o.select_scalar (`SELECT COUNT(*) FROM ${id_table}`),

        ])

		return {all, cnt}

    },

}