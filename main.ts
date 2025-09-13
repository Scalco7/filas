import { emit } from 'process';
import * as readline from 'readline';
import { EIdentifierType } from './src/enums/identifier-type.enum';
import { QueueManager } from './src/queue-manager';

const queueManager = new QueueManager();

// Exemplos de uso (descomente para testar):

console.log('\n🧪 EXECUTANDO EXEMPLOS:');

// Adiciona algumas pessoas
queueManager.addPerson('123.456.789-00', EIdentifierType.CPF, 20, 'João Silva');
queueManager.addPerson('11999887766', EIdentifierType.PHONE, 56, 'Maria Santos');
queueManager.addPerson('pedro@email.com', EIdentifierType.EMAIL, 95, 'Pedro Costa');
queueManager.addPerson('ana@email.com', EIdentifierType.EMAIL, 20);

// Mostra a fila
queueManager.showQueue();
queueManager.showStats();

// Chama primeiro
queueManager.callNext();
queueManager.showCurrent();

// Finaliza e chama próximo
queueManager.finishCurrent();
queueManager.callNext();

// Procura alguém
queueManager.findPerson('pedro@email.com');

// Mostra estado final
queueManager.showStats();
