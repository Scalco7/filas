import { EIdentifierType } from './src/enums/identifier-type.enum';
import { QueueManager } from './src/queue-manager'
import * as readlineSync from 'readline-sync';

type MenuOptions = '0' | '1' | '2' | '3' | '4' | '5' | '6';

async function menu(): Promise<boolean> {
    const option: MenuOptions = readlineSync.question(`
0 - Sair
1 - Ajuda
2 - Adicionar a fila
3 - Chamar proximo
4 - Finalizar atendimento
5 - Mostrar fila
6 - Mostrar atendimento atual
Escolha: `) as MenuOptions;

    switch (option) {
        case '0':
            return false;
        case '1':
            QueueManager.instance.help();
            break
        case '2':
            const identifierType = readlineSync.question('Digite o tipo de identificador (cpf, celular, email): ');
            const identifier = readlineSync.question('Digite o identificador: ');
            const ageText = readlineSync.question('Digite a idade: ');
            const age = parseInt(ageText);
            if (isNaN(age)) {
                console.log('A idade deve ser um número');
                return true;
            }
            const name = readlineSync.question('Digite o nome: ');

            QueueManager.instance.addPerson(identifier, identifierType as EIdentifierType, age, name);
            break
        case '3':
            QueueManager.instance.callNext();
            break
        case '4':
            QueueManager.instance.finishCurrent();
            break
        case '5':
            QueueManager.instance.showQueue();
            break
        case '6':
            QueueManager.instance.showCurrent();
            break
        default:
            console.log('Opção inválida');
            break
    }
    return true;
}

async function main(){
    console.log('=== Bem vindo ao gerenciador de filas ===');
    while (true) {
        const continueWhile = await menu();
        if (!continueWhile) break;
    }
    console.log('=== Até a próxima vez usando filas ===');
}

main()
