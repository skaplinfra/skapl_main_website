import { clientOperations } from './supabase';

export async function testClientOperations() {
  try {
    // Test creating a new client
    const newClient = await clientOperations.create({
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      industry: 'Technology'
    });
    console.log('Created client:', newClient);

    // Test getting all clients
    const allClients = await clientOperations.getAll();
    console.log('All clients:', allClients);

    // Test getting client by ID
    const client = await clientOperations.getById(newClient.id);
    console.log('Retrieved client:', client);

    // Test updating client
    const updatedClient = await clientOperations.update(newClient.id, {
      company: 'Updated Company Name'
    });
    console.log('Updated client:', updatedClient);

    // Test deleting client
    await clientOperations.delete(newClient.id);
    console.log('Client deleted successfully');

  } catch (error) {
    console.error('Error in client operations:', error);
  }
} 