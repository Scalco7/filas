import { emit } from 'process';
import * as readline from 'readline';

interface Person {
    id: string;
    identifier: string;
    identifierType: 'cpf' | 'phone' | 'email';
    age: number
    name?: string;
    timestamp: Date;
    position: number;
}

interface QueueState {
    priorityQueue: Person[];
    queue: Person[];
    currentAttendee: Person | null;
    attendeeHistory: Person[];
    attendedPriorityCount: number;
    attendedCount: number;
    nextPosition: number;
}

interface AddResult {
    success: boolean;
    message: string;
    position?: number;
}

interface CallResult {
    success: boolean;
    message: string;
    person?: Person;
}

interface FinishResult {
    success: boolean;
    message: string;
}

// Classe principal do sistema de fila
class QueueManager {
    private state: QueueState;

    constructor() {
        this.state = {
            priorityQueue: [],
            queue: [],
            attendeeHistory: [],
            currentAttendee: null,
            attendedCount: 0,
            attendedPriorityCount: 0,
            nextPosition: 1
        };

        console.log('🎯 Sistema de Controle de Filas inicializado!');
        console.log('Digite queueManager.help() para ver os comandos disponíveis.\n');
    }

    // Método de ajuda
    public help(): void {
        console.log(`
📋 COMANDOS DISPONÍVEIS:

✅ ADICIONAR À FILA:
   queueManager.addPerson('123.456.789-00', 'cpf', 'João Silva')
   queueManager.addPerson('11999887766', 'celular', 'Maria Santos')
   queueManager.addPerson('email@exemplo.com', 'email', 'Pedro Costa')
   queueManager.addPerson('email@exemplo.com', 'email') // sem nome

🔄 CONTROLAR ATENDIMENTO:
   queueManager.callNext()      // Chama próximo da fila
   queueManager.finishCurrent() // Finaliza atendimento atual

📊 VISUALIZAR INFORMAÇÕES:
   queueManager.showQueue()     // Mostra fila atual
   queueManager.showStats()     // Mostra estatísticas
   queueManager.showCurrent()   // Mostra quem está sendo atendido

🔍 CONSULTAS:
   queueManager.findPerson('123.456.789-00')  // Procura pessoa na fila
   queueManager.getQueueLength()               // Tamanho da fila
   queueManager.getAttendedCount()             // Total de atendidos

❓ AJUDA:
   queueManager.help()          // Mostra esta ajuda
        `);
    }

    // Verifica se a pessoa já está na fila
    private isAlreadyInQueue(identifier: string): boolean {
        return this.state.queue.some(person => person.identifier === identifier) ||
            ((this.state.currentAttendee && this.state.currentAttendee.identifier === identifier) || false);
    }

    // Adiciona pessoa à fila
    public addPerson(identifier: string, identifierType: 'cpf' | 'phone' | 'email', age: number, name?: string): AddResult {
        console.log(`\n➕ Tentando adicionar à fila: ${identifier} (${identifierType})`);

        const validation = this.validateIdentifier(identifier, identifierType);

        if (!validation.valid) {
            console.log(`❌ Erro: ${validation.message}`);
            return { success: false, message: validation.message! };
        }

        if (this.isAlreadyInQueue(identifier)) {
            console.log('❌ Erro: Esta pessoa já está na fila ou sendo atendida');
            return { success: false, message: 'Esta pessoa já está na fila ou sendo atendida' };
        }

        const person: Person = {
            id: Date.now().toString(),
            identifier,
            identifierType,
            age,
            name,
            timestamp: new Date(),
            position: this.state.nextPosition++
        };

        if (person.age > 60) this.state.priorityQueue.push(person);
        else this.state.queue.push(person);

        console.log(`✅ ${name || identifier} adicionado(a) à fila na posição ${person.position}`);
        console.log(`📊 Total na fila: ${this.state.queue.length}`);

        return {
            success: true,
            message: `Você foi adicionado à fila na posição ${person.position}`,
            position: person.position
        };
    }

    // Chama próxima pessoa
    public callNext(): CallResult {
        console.log('\n🔔 Chamando próximo da fila...');

        if (this.state.currentAttendee) {
            console.log('❌ Já existe um atendimento em andamento');
            console.log(`👤 Atendendo: ${this.state.currentAttendee.name || this.state.currentAttendee.identifier}`);
            return { success: false, message: 'Já existe um atendimento em andamento' };
        }

        if (this.state.queue.length === 0) {
            console.log('❌ Não há ninguém na fila');
            return { success: false, message: 'Não há ninguém na fila' };
        }

        const hasPrirityPerson = this.state.priorityQueue.length > 0;

        let nextPerson;
        if (hasPrirityPerson && this.state.attendedPriorityCount < 2) {
            nextPerson = this.state.priorityQueue.shift()!;
            this.state.attendedPriorityCount = this.state.attendedPriorityCount + 1;
        } else {
            nextPerson = this.state.queue.shift()!;
            this.state.attendedPriorityCount = 0;
        }

        if(this.state.currentAttendee) this.state.attendeeHistory.push(this.state.currentAttendee);
        this.state.currentAttendee = nextPerson;

        console.log(`📢 CHAMANDO: ${nextPerson.name || nextPerson.identifier}`);
        console.log(`📋 Identificador: ${nextPerson.identifierType.toUpperCase()}: ${nextPerson.identifier}`);
        console.log(`⏰ Entrada na fila: ${nextPerson.timestamp.toLocaleString()}`);
        console.log(`📊 Restam na fila: ${this.state.queue.length}`);

        return {
            success: true,
            message: `Chamando: ${nextPerson.name || nextPerson.identifier}`,
            person: nextPerson
        };
    }

    // Finaliza atendimento atual
    public finishCurrent(): FinishResult {
        console.log('\n✅ Finalizando atendimento...');

        if (!this.state.currentAttendee) {
            console.log('❌ Não há atendimento em andamento');
            return { success: false, message: 'Não há atendimento em andamento' };
        }

        const finishedPerson = this.state.currentAttendee;
        this.state.currentAttendee = null;
        this.state.attendedCount++;

        console.log(`✅ Atendimento finalizado: ${finishedPerson.name || finishedPerson.identifier}`);
        console.log(`📊 Total de pessoas atendidas: ${this.state.attendedCount}`);
        console.log(`📊 Restam na fila: ${this.state.queue.length}`);

        return { success: true, message: 'Atendimento finalizado' };
    }

    // Mostra a fila atual
    public showQueue(): void {
        console.log('\n📋 FILA ATUAL:');
        console.log('═'.repeat(60));

        if (this.state.queue.length === 0) {
            console.log('   Fila vazia');
            return;
        }

        this.state.queue.forEach((person, index) => {
            const position = index + 1;
            const isNext = position === 1;
            const prefix = isNext ? '👉' : '  ';
            const name = person.name || person.identifier;
            const time = person.timestamp

            console.log(`${prefix} ${position}º - ${name}`);
            console.log(`     ${person.identifierType.toUpperCase()}: ${person.identifier} | ${time}`);
            if (index < this.state.queue.length - 1) console.log('');
        });
    }

    // Mostra a fila prioritária
    public showPriorityQueue(): void {
        console.log('\n📋 FILA PRIORITÁRIA ATUAL:');
        console.log('═'.repeat(60));

        if (this.state.priorityQueue.length === 0) {
            console.log('   Fila vazia');
            return;
        }

        this.state.priorityQueue.forEach((person, index) => {
            const position = index + 1;
            const isNext = position === 1;
            const prefix = isNext ? '👉' : '  ';
            const name = person.name || person.identifier;
            const time = person.timestamp

            console.log(`${prefix} ${position}º - ${name}`);
            console.log(`     ${person.identifierType.toUpperCase()}: ${person.identifier} | ${time}`);
            if (index < this.state.priorityQueue.length - 1) console.log('');
        });
    }

    // Mostra quem está sendo atendido
    public showCurrent(): void {
        console.log('\n👤 ATENDIMENTO ATUAL:');
        console.log('═'.repeat(40));

        if (!this.state.currentAttendee) {
            console.log('   Nenhum atendimento em andamento');
            return;
        }

        const person = this.state.currentAttendee;
        console.log(`📢 Atendendo: ${person.name || person.identifier}`);
        console.log(`📋 ${person.identifierType.toUpperCase()}: ${person.identifier}`);
        console.log(`⏰ Entrada: ${person.timestamp.toLocaleString()}`);
    }

    // Mostra estatísticas
    public showStats(): void {
        console.log('\n📊 ESTATÍSTICAS:');
        console.log('═'.repeat(30));
        console.log(`📋 Na fila: ${this.state.queue.length}`);
        console.log(`📋 Na fila prioritária: ${this.state.priorityQueue.length}`);
        console.log(`👤 Sendo atendido: ${this.state.currentAttendee ? 1 : 0}`);
        console.log(`✅ Já atendidos: ${this.state.attendedCount}`);
        console.log(`🔢 Próximo número: ${this.state.nextPosition}`);
        console.log(`📈 Total processado: ${this.state.attendedCount + (this.state.currentAttendee ? 1 : 0)}`);
    }

    // Procura pessoa na fila
    public findPerson(identifier: string): void {
        console.log(`\n🔍 Procurando: ${identifier}`);

        // Verifica se está sendo atendido
        if (this.state.currentAttendee && this.state.currentAttendee.identifier === identifier) {
            console.log('📢 Esta pessoa está sendo atendida no momento');
            return;
        }

        // Procura na fila
        const personIndex = this.state.queue.findIndex(person => person.identifier === identifier);
        const prirityPersonIndex = this.state.priorityQueue.findIndex(person => person.identifier === identifier);

        if (personIndex === -1 && prirityPersonIndex === -1) {
            console.log('❌ Pessoa não encontrada na fila');
            return;
        }
        let person;
        let position;

        if (personIndex) {
            person = this.state.queue[personIndex];
            position = personIndex + 1;
        } else {
            person = this.state.priorityQueue[prirityPersonIndex];
            position = prirityPersonIndex + 1;
        }

        console.log(`✅ Pessoa encontrada na posição ${position}`);
        console.log(`👤 Nome: ${person.name || 'Não informado'}`);
        console.log(`📋 ${person.identifierType.toUpperCase()}: ${person.identifier}`);
        console.log(`⏰ Entrada: ${person.timestamp.toLocaleString()}`);
    }

    // Getters públicos
    public getQueueLength(): number {
        return this.state.queue.length;
    }

    public getCurrentAttendee(): Person | null {
        return this.state.currentAttendee;
    }

    public getAttendedCount(): number {
        return this.state.attendedCount;
    }

    // Método para limpar a fila (útil para testes)
    public clearQueue(): void {
        console.log('\n🗑️  Limpando fila...');
        this.state.queue = [];
        this.state.currentAttendee = null;
        console.log('✅ Fila limpa (mantendo contador de atendidos)');
    }

    // Método para resetar tudo
    public reset(): void {
        console.log('\n🔄 Resetando sistema...');
        this.state = {
            priorityQueue: [],
            queue: [],
            attendeeHistory: [],
            currentAttendee: null,
            attendedCount: 0,
            attendedPriorityCount: 0,
            nextPosition: 1
        };
        console.log('✅ Sistema resetado completamente');
    }
}

// Instância global do gerenciador
const queueManager = new QueueManager();

// Exporta para uso em módulos (opcional)
export { QueueManager, queueManager };

// Exemplos de uso (descomente para testar):

console.log('\n🧪 EXECUTANDO EXEMPLOS:');

// Adiciona algumas pessoas
queueManager.addPerson('123.456.789-00', 'cpf', 20, 'João Silva');
queueManager.addPerson('11999887766', 'phone', 56, 'Maria Santos');
queueManager.addPerson('pedro@email.com', 'email', 95, 'Pedro Costa');
queueManager.addPerson('ana@email.com', 'email', 20);

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
