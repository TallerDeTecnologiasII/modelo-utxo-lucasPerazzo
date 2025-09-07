import { getUTXOKey, Transaction, TransactionInput, UtxoId } from './types';
import { UTXOPoolManager } from './utxo-pool';
import { verify } from './utils/crypto';
import {
  ValidationResult,
  ValidationError,
  VALIDATION_ERRORS,
  createValidationError
} from './errors';

export class TransactionValidator {
  constructor(private utxoPool: UTXOPoolManager) {}

  /**
   * Validate a transaction
   * @param {Transaction} transaction - The transaction to validate
   * @returns {ValidationResult} The validation result
   */
  validateTransaction(transaction: Transaction): ValidationResult {
    const errors: ValidationError[] = [];
    const listaDeInputs= transaction.inputs;
    const utxosVistos = new Set<UtxoId>();
    let totalInputAmount = 0;
    let totalOutputAmount = 0;
    for(let input of listaDeInputs){
      const utxo = this.utxoPool.getUTXO(input.utxoId.txId, input.utxoId.outputIndex);

      //VERIFICACION 1
      if (!utxo) {
        errors.push(createValidationError(
        VALIDATION_ERRORS.UTXO_NOT_FOUND,
        `UTXO not found: ${input.utxoId.txId}:${input.utxoId.outputIndex}`,
        { utxoId: input.utxoId }
      ));
      }
      // PARA VERIFICACION 2
      totalInputAmount += this.utxoPool.getUTXO(input.utxoId.txId, input.utxoId.outputIndex)?.amount || 0;

      // VERIFICACION 3
      const transactionData = this.createTransactionDataForSigning_(transaction);
      const isValid = verify(transactionData, input.signature, input.owner);
      if (!isValid) {
        errors.push(createValidationError(
          VALIDATION_ERRORS.INVALID_SIGNATURE,
          `Invalid signature for input: ${input.utxoId.txId}:${input.utxoId.outputIndex}`,
          { utxoId: input.utxoId }
        ));
      }

      // VERIFICACION 4
      if (utxosVistos.has(input.utxoId)) {
      errors.push(createValidationError(
        VALIDATION_ERRORS.DOUBLE_SPENDING,
        `UTXO referenced multiple times in transaction: ${input.utxoId}`,
        { utxoId: input.utxoId }
      ));
      continue;
    }
    utxosVistos.add(input.utxoId);
    }
    const listaDeOutputs= transaction.outputs;
    for(let output of listaDeOutputs){
      // PARA VERIFICACION 2
      totalOutputAmount += output.amount;

      // VERIFICACION DE MONTO NEGATIVO, quedaba un test colgado asi que puse menor igual
      if (output.amount <= 0) {
        errors.push(createValidationError(
          VALIDATION_ERRORS.NEGATIVE_AMOUNT,
          `Output amount is negative: ${output.amount}`,
          { output }
        ));
      }
    }
    //VERIFIACION 2
    if(totalInputAmount !== totalOutputAmount){
      errors.push(createValidationError(VALIDATION_ERRORS.AMOUNT_MISMATCH,
      `Input amount (${totalInputAmount}) does not match output amount (${totalOutputAmount})`, {}));
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a deterministic string representation of the transaction for signing
   * This excludes the signatures to prevent circular dependencies
   * @param {Transaction} transaction - The transaction to create a data for signing
   * @returns {string} The string representation of the transaction for signing
   */
  private createTransactionDataForSigning_(transaction: Transaction): string {
    const unsignedTx = {
      id: transaction.id,
      inputs: transaction.inputs.map(input => ({
        utxoId: input.utxoId,
        owner: input.owner
      })),
      outputs: transaction.outputs,
      timestamp: transaction.timestamp
    };

    return JSON.stringify(unsignedTx);
  }
}
