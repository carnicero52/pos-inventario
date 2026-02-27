import { db } from './src/lib/db';
import { nanoid } from 'nanoid';

async function seed() {
  try {
    // Crear usuario admin si no existe
    const adminExists = await db.usuario.findUnique({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await db.usuario.create({
        data: {
          id: nanoid(),
          username: 'admin',
          password: 'admin123',
          nombre: 'Administrador',
          rol: 'ADMIN',
          activo: true,
          permVentas: true,
          permInventario: true,
          permClientes: true,
          permProveedores: true,
          permCompras: true,
          permReportes: true,
          permGastos: true,
          permConfig: true,
          permUsuarios: true,
        }
      });
      console.log('✅ Usuario admin creado');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }

    // Crear configuración de empresa si no existe
    const empresaExists = await db.empresa.findUnique({ where: { id: 'default' } });
    
    if (!empresaExists) {
      await db.empresa.create({
        data: {
          id: 'default',
          nombre: 'Mi Empresa',
          moneda: 'Q',
          simboloMoneda: 'Q'
        }
      });
      console.log('✅ Configuración de empresa creada');
    }

    // Crear categoría por defecto
    const catExists = await db.categoria.findFirst();
    if (!catExists) {
      await db.categoria.create({
        data: {
          id: nanoid(),
          nombre: 'General',
          descripcion: 'Categoría general',
          activa: true
        }
      });
      console.log('✅ Categoría por defecto creada');
    }

    console.log('\n🎉 Seed completado!');
    console.log('👤 Usuario: admin');
    console.log('🔑 Contraseña: admin123');
    
  } catch (error) {
    console.error('Error en seed:', error);
  }
}

seed();
