const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()
const app = express()
const PORT = process.env.PORT || 3000

const supabaseUrl = 'https://kdiglhslqmzgdmfkjedg.supabase.co'

// Configurar el middleware morgan con el formato deseado
app.use(morgan('combined'))

app.use(express.json()) // Para analizar datos JSON en el cuerpo
app.use(express.urlencoded({ extended: true })) // Para analizar datos de formularios
app.use(express.static(path.join(__dirname, 'public')))

const supabaseKey = process.env.supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)

app.get('/productos', async (req, res) => {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')

    if (error) {
      console.error(error)
      return res.status(500).send('<p>Error al obtener los productos</p>')
    }

    let htmlResponse =
      '<h2>Listado de Productos</h2><li><a href="/">Home</a></li><ul>'
    productos.forEach((producto) => {
      htmlResponse += `<li><strong>${producto.name}</strong> - Precio: ${producto.price} <a href="/borrar-producto/${producto.id}">Delete</a></li>`
    })
    htmlResponse += '</ul>'

    res.send(htmlResponse) // Enviar el HTML directamente
  } catch (err) {
    console.error(err)
    res.status(500).send('<p>Error al procesar la solicitud</p>')
  }
})

app.get('/borrar-producto/:id', async (req, res) => {
  const productId = req.params.id

  try {
    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productId)
    if (error) {
      console.error(error)
      return res.status(500).send('<p>Error al borrar el producto</p>')
    }

    console.log('Producto borrado exitosamente:', data)
    res.redirect('/productos') // Redirigir a la lista de productos después de borrar
  } catch (err) {
    console.error(err)
    res.status(500).send('<p>Error al procesar la solicitud</p>')
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index'))
})

app.post('/submit', async (req, res) => {
  const { nombre, precio } = req.body
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([{ name: nombre, price: precio }])

    if (error) {
      console.log(error)
      res.status(500).send('Error al agregar el producto')
    } else {
      console.log('Producto añadido correctamente')
      res.redirect('/')
    }
  } catch (err) {
    console.log(err)
    res.status(500).send('Error al procesar la solicitud')
  }
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
