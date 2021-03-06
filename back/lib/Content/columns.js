module.exports = {

////////////////////////////////////////////////////////////////////////////////

get_vocs_of_columns: 

    function () {

        return this.db.add_vocabularies ({_fields: this.db.model.tables.columns.columns}, {
        })

    },
    
////////////////////////////////////////////////////////////////////////////////

select_columns: 
    
    function () {
   
        this.rq.sort = this.rq.sort || [{field: "id", direction: "asc"}]

        if (this.rq.searchLogic == 'OR') {

            let q = this.rq.search [0].value

            this.rq.search = [
                {field: 'name',   operator: 'is', value: q},
                {field: 'note',   operator: 'contains', value: q},
            ]

        }
    
        let filter = this.w2ui_filter ()
        
        let {id_table, id_ref_table} = this.rq; 
        
        if (id_table) filter ['id LIKE'] = id_table + '.%'
        
        if (id_ref_table) filter.id_ref_table = id_ref_table

        return this.db.add_all_cnt ({}, [
        	{'columns_vw AS columns': filter},
        	'tables_vw(note) AS tables ON id_table',
        	'tables_vw(note) AS ref ON id_ref_table',
        ])

    },
    
////////////////////////////////////////////////////////////////////////////////

get_versions_of_columns: 
    
    function () {
   
        this.rq.sort = this.rq.sort || [{field: "_ts", direction: "desc"}]

        let filter = this.w2ui_filter ()  
        
        filter._id = this.rq._id
        
        return this.db.add_all_cnt ({}, [
        	{'columns_versions': filter},
        	'users ON _id_user'
        ])

    },    

////////////////////////////////////////////////////////////////////////////////
    
get_item_of_columns: 

    async function () {
    
    	let {id} = this.rq

        let data = await this.db.get ([{columns_vw: {id}}])

        data._fields = this.db.model.tables.columns.columns
        
        return data

    },
    
////////////////////////////////////////////////////////////////////////////////

do_update_columns: 

    async function () {
    
        let {id, data} = this.rq
        
        data.id = id
        
        await this.db.update ('columns', data)

	},

////////////////////////////////////////////////////////////////////////////////

do_delete_columns: 

    async function () {
    
    	let {db, rq} = this
            
        await db.do ('DELETE FROM columns WHERE id = ? AND is_confirmed = 0', [rq.id])

	},

////////////////////////////////////////////////////////////////////////////////

do_clone_columns: 

    async function () {
    
        let {db, rq} = this, {id, data} = rq, {name, note} = data
        
        let [b, t, c] = id.split ('.')
        
        try {

            await db.do (`
		    
		    	INSERT INTO columns (
					id           , 
					is_pk        ,  
					type         , 
					note         , 
					id_ref_table , 
					is_confirmed 
		    	)
		    	SELECT
					? id         , 
					0 is_pk      ,  
					type         , 
					? note       , 
					id_ref_table , 
					0 is_confirmed 
		    	FROM
		    		columns
		    	WHERE
		    		id = ?
		    
		    `, [[b, t, name].join ('.'), note, id])

        }
        catch (e) {
        
        	throw !db.is_pk_violation (e) ? e : '#name#: Поле с таким именем уже существует'
        
        }
        
	},

}