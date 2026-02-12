import { useRef, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuaranteeTermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TERMS_TEXT = `TERMOS DE GARANTIA E CONDIÇÕES DE SERVIÇO

Última atualização: fevereiro de 2025

Ao contratar nossos serviços de assistência técnica, você concorda com os termos e condições descritos abaixo. Leia com atenção antes de prosseguir.

1. DIAGNÓSTICO E ORÇAMENTO
Os valores apresentados no orçamento online são valores base e podem variar após a avaliação física do aparelho. O orçamento final será confirmado pela equipe técnica antes da execução de qualquer serviço. Caso o valor final seja diferente do estimado, você será notificado e poderá aceitar ou recusar o serviço sem nenhum custo adicional.

2. GARANTIA DO SERVIÇO
Todos os serviços realizados possuem garantia de 90 (noventa) dias corridos, contados a partir da data de devolução do aparelho ao cliente. A garantia cobre exclusivamente o serviço executado e a peça substituída.

A garantia NÃO cobre:
• Danos causados por mau uso, quedas, impacto ou contato com líquidos após o reparo;
• Problemas em componentes não relacionados ao serviço realizado;
• Aparelhos que tenham sido abertos ou reparados por terceiros após nosso serviço;
• Danos decorrentes de uso de acessórios não compatíveis ou de procedência duvidosa;
• Defeitos causados por software, vírus ou atualizações do sistema operacional.

3. PEÇAS E COMPONENTES
As peças utilizadas nos reparos podem ser originais ou compatíveis de alta qualidade, conforme disponibilidade e modelo do aparelho. Informaremos previamente o tipo de peça a ser utilizada. Variações de tonalidade, brilho ou sensibilidade podem ocorrer em peças compatíveis, sem que isso constitua defeito.

4. APARELHOS COM SINAIS DE OXIDAÇÃO OU QUEDA
Aparelhos que apresentem sinais de oxidação (contato com líquido) ou danos por queda podem ter componentes internos comprometidos que só serão identificados após a abertura. Nesses casos:
• Não garantimos a resolução completa de todos os problemas;
• Novos defeitos podem surgir durante ou após o reparo, decorrentes do estado prévio do aparelho;
• Informaremos sobre os riscos antes de prosseguir com o serviço.

5. TESTES E RETIRADA DO APARELHO
Após a conclusão do serviço, o aparelho passará por testes de funcionamento. Recomendamos que o cliente realize seus próprios testes no momento da retirada. Reclamações sobre o serviço realizado devem ser feitas dentro do período de garantia.

O aparelho deverá ser retirado em até 90 (noventa) dias após a notificação de conclusão. Após esse prazo, não nos responsabilizamos pela guarda do equipamento.

6. BACKUP E DADOS PESSOAIS
O cliente é integralmente responsável por realizar o backup de todos os dados pessoais (fotos, contatos, mensagens, aplicativos etc.) antes de entregar o aparelho. Não nos responsabilizamos por perda de dados durante o processo de reparo. Recomendamos fortemente que remova contas pessoais e senhas antes do envio.

7. PRAZO DE EXECUÇÃO
O prazo estimado para execução do serviço é de 3 a 7 dias úteis, podendo variar conforme a complexidade do reparo e disponibilidade de peças. Caso haja necessidade de prazo maior, o cliente será informado.

8. ENVIO E TRANSPORTE
Quando o envio do aparelho for realizado via transportadora ou correios:
• O cliente é responsável pela embalagem adequada do aparelho para envio;
• Recomendamos o uso de seguro de transporte;
• Não nos responsabilizamos por danos ocorridos durante o transporte de ida ou volta, salvo quando o envio for realizado por nossa logística própria;
• O prazo de reparo começa a contar a partir do recebimento do aparelho em nossa unidade.

9. AUTORIZAÇÃO PARA ABERTURA E SUBSTITUIÇÃO
Ao prosseguir com o envio do aparelho, você autoriza nossa equipe técnica a:
• Abrir o aparelho para diagnóstico e reparo;
• Substituir peças e componentes conforme necessário para a execução do serviço contratado;
• Realizar testes de funcionamento.

10. ACEITE DOS TERMOS
Ao continuar, você declara que leu, compreendeu e concorda com todos os termos e condições descritos acima. Estes termos fazem parte do contrato de prestação de serviço entre você e a PowerCell Assistência Técnica.

Ao continuar, declaro que li e concordo com os Termos de Garantia e Condições de Serviço.`;

export function GuaranteeTermsModal({ open, onClose, onAccept }: GuaranteeTermsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canAccept, setCanAccept] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setCanAccept(true);
    }
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCanAccept(false);
      // Check if content is shorter than container (no scroll needed)
      setTimeout(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 5) {
          setCanAccept(true);
        }
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Termos de Garantia</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Leia até o final para continuar</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="max-h-[55vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-zinc-200 whitespace-pre-line"
        >
          {TERMS_TEXT}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5"
            onClick={onClose}
          >
            Voltar
          </Button>
          <Button
            disabled={!canAccept}
            onClick={onAccept}
            className={`flex-1 font-semibold transition-all ${
              canAccept
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-zinc-700 text-zinc-500 opacity-50 cursor-not-allowed"
            }`}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
