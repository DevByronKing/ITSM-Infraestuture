import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
interface ActionChip {
    label: string;
    prompt: string;
}

interface CopilotResponse {
    reply: string;
    actions?: ActionChip[];
    category: string;
}

// ─────────────────────────────────────────────
// Helpers de Detecção de Intenção
// ─────────────────────────────────────────────
function detectIntent(msg: string): string {
    const m = msg.toLowerCase();
    if (/(chamado|ticket|incidente|helpdesk|urgente|crítico|aberti|aberto)/i.test(m)) return 'chamados';
    if (/(estoque|almoxarifado|insumo|material|falta|reposição|compra)/i.test(m)) return 'almoxarifado';
    if (/(ativo|equipamento|hardware|servidor|switch|inventário|manutenção)/i.test(m)) return 'ativos';
    if (/(empréstimo|checkout|devolução|emprestado)/i.test(m)) return 'checkout';
    if (/(plano|planejamento|semana|prioridade|organizar|agenda|tarefa)/i.test(m)) return 'planejamento';
    if (/(resumo|situação|briefing|relatório|status|geral|visão)/i.test(m)) return 'resumo';
    if (/(ping|rede|offline|conexão|link|switch|tráfego)/i.test(m)) return 'rede';
    if (/(nobreak|ups|bateria|energia)/i.test(m)) return 'nobreak';
    if (/(impressora|zebra|ribbon|etiqueta|térmica)/i.test(m)) return 'impressora';
    if (/(sla|contrato|garantia|vencimento|licença)/i.test(m)) return 'sla';
    return 'geral';
}

// ─────────────────────────────────────────────
// Engine de Resposta
// ─────────────────────────────────────────────
async function generateResponse(userMessage: string): Promise<CopilotResponse> {
    const intent = detectIntent(userMessage);
    let supabaseData: Record<string, unknown> = {};

    // Tenta buscar dados reais do Supabase
    if (supabaseUrl && supabaseKey) {
        try {
            const sb = createClient(
                supabaseUrl || 'https://placeholder.supabase.co', 
                supabaseKey || 'placeholder'
            );

            const [chamadosRes, ativosRes, almoxRes, checkoutRes] = await Promise.all([
                sb.from('chamados').select('id, title, priority, status, requester, department').neq('status', 'Resolvido').order('created_at', { ascending: false }).limit(5),
                sb.from('ativos').select('id, name, status, location').eq('status', 'Manutenção').limit(5),
                sb.from('almoxarifado').select('id, name, qty, min_qty, category').limit(20),
                sb.from('checkout_loans').select('id, asset_name, borrower_name, expected_return_date, status').eq('status', 'Ativo').limit(5),
            ]);

            supabaseData = {
                chamados: chamadosRes.data || [],
                ativos: ativosRes.data || [],
                almoxarifado: almoxRes.data || [],
                checkout: checkoutRes.data || [],
            };
        } catch (_) {
            // fallback: dados vazios, respostas genéricas
        }
    }

    const chamados = (supabaseData.chamados as any[]) || [];
    const ativos = (supabaseData.ativos as any[]) || [];
    const almox = (supabaseData.almoxarifado as any[]) || [];
    const checkout = (supabaseData.checkout as any[]) || [];
    const almoxCritico = almox.filter((i: any) => i.qty <= i.min_qty);

    // ─────────────────────────────────────────────
    // Respostas por Intenção
    // ─────────────────────────────────────────────

    if (intent === 'chamados') {
        if (chamados.length === 0) {
            return {
                category: 'Helpdesk',
                reply: '✅ **Nenhum chamado aberto no momento!** A fila de atendimento está limpa. Aproveite para realizar manutenções preventivas ou atualizar a base de conhecimento.',
                actions: [
                    { label: '📋 Planejar semana', prompt: 'Crie um plano de atividades para a semana' },
                    { label: '📦 Ver estoque', prompt: 'Qual o status do almoxarifado?' },
                ],
            };
        }
        const criticos = chamados.filter((c: any) => c.priority === 'Alta' || c.priority.includes('Crítica') || c.priority.includes('ritic'));
        let reply = `🚨 **${chamados.length} chamado(s) aberto(s) no momento.**\n\n`;
        if (criticos.length > 0) {
            reply += `**⚡ Prioridade Alta / Crítica:**\n`;
            criticos.slice(0, 3).forEach((c: any) => {
                reply += `• **#${c.id}** — ${c.title} *(${c.requester}, ${c.department})*\n`;
            });
            reply += '\n';
        }
        const outros = chamados.filter((c: any) => !criticos.includes(c));
        if (outros.length > 0) {
            reply += `**📋 Demais pendências:**\n`;
            outros.slice(0, 3).forEach((c: any) => {
                reply += `• **#${c.id}** — ${c.title}\n`;
            });
        }
        reply += `\n💡 **Recomendação:** Atenda os críticos primeiro. Comunique ao solicitante o prazo estimado de resolução.`;
        return {
            category: 'Helpdesk',
            reply,
            actions: [
                { label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' },
                { label: '📅 Planejar semana', prompt: 'Crie um plano de atividades para a semana' },
            ],
        };
    }

    if (intent === 'almoxarifado') {
        if (almox.length === 0) {
            return {
                category: 'Almoxarifado',
                reply: '📦 **Almoxarifado:** Não foi possível carregar os dados de estoque no momento. Verifique a conexão com o banco de dados.',
                actions: [{ label: '🔄 Tentar novamente', prompt: 'Qual o status do almoxarifado?' }],
            };
        }
        let reply = '';
        if (almoxCritico.length > 0) {
            reply += `⚠️ **${almoxCritico.length} item(s) abaixo do estoque mínimo:**\n\n`;
            almoxCritico.forEach((i: any) => {
                reply += `• **${i.name}** — Atual: \`${i.qty}\` / Mínimo: \`${i.min_qty}\` ⚠️\n`;
            });
            reply += `\n💡 **Ação recomendada:** Gere uma requisição de compra para esses itens. Priorize os que têm menor quantidade relativa.`;
        } else {
            reply = `✅ **Estoque OK!** Todos os ${almox.length} itens do almoxarifado estão acima do nível mínimo.\n\n`;
            reply += `📦 **Itens monitorados:**\n`;
            almox.slice(0, 4).forEach((i: any) => {
                reply += `• ${i.name}: \`${i.qty} ${i.unit || 'und'}\`\n`;
            });
        }
        return {
            category: 'Almoxarifado',
            reply,
            actions: [
                { label: '🚨 Ver chamados urgentes', prompt: 'Quais chamados estão urgentes?' },
                { label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' },
            ],
        };
    }

    if (intent === 'ativos') {
        if (ativos.length === 0) {
            return {
                category: 'Inventário',
                reply: '✅ **Todos os ativos estão operacionais!** Nenhum equipamento em modo de Manutenção no momento.',
                actions: [
                    { label: '📦 Verificar estoque', prompt: 'Qual o status do almoxarifado?' },
                    { label: '📅 Planejar manutenção', prompt: 'Crie um cronograma de manutenção preventiva' },
                ],
            };
        }
        let reply = `🔧 **${ativos.length} ativo(s) em Manutenção:**\n\n`;
        ativos.forEach((a: any) => {
            reply += `• **${a.name}** — Localização: ${a.location || 'Não informada'}\n`;
        });
        reply += `\n💡 **Dica:** Verifique se algum desses equipamentos está impactando usuários em produção. Se sim, priorize a resolução ou providencie um substituto temporário.`;
        return {
            category: 'Inventário',
            reply,
            actions: [
                { label: '🚨 Ver chamados', prompt: 'Quais chamados estão urgentes?' },
                { label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' },
            ],
        };
    }

    if (intent === 'checkout') {
        const hoje = new Date();
        const vencidos = checkout.filter((c: any) => c.expected_return_date && new Date(c.expected_return_date) < hoje);
        if (checkout.length === 0) {
            return {
                category: 'Empréstimos',
                reply: '✅ **Nenhum empréstimo ativo no momento.** Todos os equipamentos estão devidamente alocados.',
            };
        }
        let reply = `📤 **${checkout.length} empréstimo(s) ativo(s):**\n\n`;
        if (vencidos.length > 0) {
            reply += `**⚠️ Devoluções em atraso (${vencidos.length}):**\n`;
            vencidos.forEach((c: any) => {
                reply += `• **${c.asset_name}** com ${c.borrower_name} — venceu em ${new Date(c.expected_return_date).toLocaleDateString('pt-BR')}\n`;
            });
            reply += '\n';
        }
        const ativos_checkout = checkout.filter((c: any) => !vencidos.includes(c));
        if (ativos_checkout.length > 0) {
            reply += `**📋 Em aberto:**\n`;
            ativos_checkout.slice(0, 3).forEach((c: any) => {
                reply += `• **${c.asset_name}** com ${c.borrower_name}\n`;
            });
        }
        return {
            category: 'Empréstimos',
            reply,
            actions: [{ label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' }],
        };
    }

    if (intent === 'planejamento') {
        const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
        const tarefa_base = [
            { dia: 'Segunda-feira', tarefas: ['📋 Triagem e priorização de chamados abertos', '🔍 Verificação de logs e alertas do fim de semana', '📦 Conferência de estoque mínimo no almoxarifado'] },
            { dia: 'Terça-feira', tarefas: ['🔧 Execução de manutenções preventivas agendadas', '📡 Teste de links de rede e conectividade', '📂 Atualização de documentação na base de conhecimento'] },
            { dia: 'Quarta-feira', tarefas: ['💻 Revisão de inventário de ativos (status e localização)', '🔐 Verificação de patches e atualizações de segurança', '📤 Acompanhamento de empréstimos e devoluções'] },
            { dia: 'Quinta-feira', tarefas: ['📊 Geração de relatório executivo semanal', '🤝 Reunião de alinhamento com gestores (se houver)', '🔋 Verificação de nobreaks e sistemas de energia'] },
            { dia: 'Sexta-feira', tarefas: ['✅ Fechamento de chamados resolvidos', '📝 Planejamento de atividades para a próxima semana', '🔄 Backup de configurações críticas (switches, firewalls)'] },
        ];

        let reply = `📅 **Plano de Atividades da Semana — Infraestrutura TI**\n\n`;
        if (chamados.length > 0) {
            reply += `> ⚠️ *Atenção: há **${chamados.length} chamado(s) aberto(s)** que devem ser integrados à rotina diária.*\n\n`;
        }
        tarefa_base.forEach(({ dia, tarefas }) => {
            reply += `**${dia}**\n`;
            tarefas.forEach(t => reply += `  ${t}\n`);
            reply += '\n';
        });
        reply += `\n💡 *Adapte conforme as prioridades dinâmicas do dia. Mantenha o ITSM atualizado!*`;
        return {
            category: 'Planejamento',
            reply,
            actions: [
                { label: '🚨 Ver chamados urgentes', prompt: 'Quais chamados estão urgentes?' },
                { label: '⚠️ Estoque crítico', prompt: 'Qual o status do almoxarifado?' },
            ],
        };
    }

    if (intent === 'rede') {
        return {
            category: 'Rede',
            reply: `📡 **Diagnóstico de Rede:**\n\nPara verificar dispositivos offline, utilize o **Ping Sweeper** disponível no Dashboard Principal. Ele realiza varredura de IPs automaticamente.\n\n**Checklist de troubleshooting:**\n• Verifique o painel do switch core (luzes de porta)\n• Confirme se a alimentação elétrica do rack está estável\n• Cheque o log do firewall para bloqueios inesperados\n• Teste a conectividade a partir de um segundo ponto\n\n💡 Se o problema persistir, abra um chamado de Prioridade Alta no Helpdesk e notifique a equipe responsável.`,
            actions: [
                { label: '🚨 Abrir chamado crítico', prompt: 'Quais chamados estão urgentes?' },
                { label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' },
            ],
        };
    }

    if (intent === 'nobreak') {
        return {
            category: 'Energia',
            reply: `🔋 **Gestão de Nobreaks e UPS:**\n\n**Verificações recomendadas:**\n• 🔋 Teste de autonomia de bateria (descarga controlada)\n• ⚡ Verificação de alarmes ativos no painel do nobreak\n• 📅 Consulte o módulo **Contratos & Lifecycle** para ver se há SLAs de manutenção vencendo\n• 🌡️ Monitore a temperatura do ambiente — calor excessivo reduz a vida útil das baterias\n\n**Intervalo recomendado de troca de baterias:** 18 a 24 meses (verifique o manual do fabricante).\n\n💡 Registre o próximo check como manutenção preventiva nos Ativos do sistema.`,
            actions: [
                { label: '📋 Verificar contratos SLA', prompt: 'Verifique os contratos e SLAs' },
                { label: '🔧 Ativos em manutenção', prompt: 'Quais equipamentos estão em manutenção?' },
            ],
        };
    }

    if (intent === 'impressora') {
        return {
            category: 'Impressão',
            reply: `🖨️ **Gestão de Impressoras e Coletores:**\n\n**Ações recomendadas para Zebra / Impressoras Térmicas:**\n• 🔧 Verifique a calibragem do sensor térmico (ribbon e mídia)\n• 🧹 Limpe o cabeçote de impressão com álcool isopropílico\n• 📦 Consulte o **Almoxarifado** para verificar o estoque de ribbons e etiquetas\n• 🌐 Para impressoras WiFi, confirme que estão na VLAN correta e com IP fixo\n\n**Coletores de Dados (TC52/TC57):**\n• Verifique a versão do firmware\n• Cheque bateria e condição física\n• Revalide a conexão com o ERP/WMS\n\n💡 Abra um chamado de manutenção se o problema for recorrente.`,
            actions: [
                { label: '📦 Ver estoque ribbons', prompt: 'Qual o status do almoxarifado?' },
                { label: '🚨 Abrir chamado', prompt: 'Quais chamados estão urgentes?' },
            ],
        };
    }

    if (intent === 'sla') {
        return {
            category: 'Contratos',
            reply: `📋 **Gestão de Contratos & SLAs:**\n\nAcesse o módulo **Contratos & Lifecycle** na sidebar para ver todos os contratos cadastrados com suas datas de vencimento.\n\n**Boas práticas para gestão de SLA:**\n• 📅 Revise contratos com 60 dias de antecedência ao vencimento\n• 📧 Configure alertas automáticos no Centro de Alertas & IA\n• 📊 Documente o histórico de serviços na Base de Conhecimento\n• 🤝 Mantenha o contato do fornecedor atualizado no sistema\n\n💡 Equipamentos sem contrato ativo são candidatos prioritários para manutenção preventiva interna.`,
            actions: [
                { label: '📅 Ver contratos', prompt: 'Verifique os contratos e SLAs' },
                { label: '📊 Resumo geral', prompt: 'Me dê um resumo geral da operação' },
            ],
        };
    }

    // ── Resumo Geral ──────────────────────────────────────────────────────────
    if (intent === 'resumo') {
        let reply = `📊 **Briefing Operacional — ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}**\n\n`;

        // Chamados
        const criticos = chamados.filter((c: any) => c.priority === 'Alta' || c.priority.includes('ritic'));
        if (chamados.length > 0) {
            reply += `🚨 **Helpdesk:** ${chamados.length} chamado(s) aberto(s)`;
            if (criticos.length > 0) reply += ` — **${criticos.length} crítico(s)**`;
            reply += '\n';
        } else {
            reply += `✅ **Helpdesk:** Nenhum chamado aberto\n`;
        }

        // Ativos
        if (ativos.length > 0) {
            reply += `🔧 **Ativos:** ${ativos.length} equipamento(s) em manutenção\n`;
        } else {
            reply += `✅ **Ativos:** Todos operacionais\n`;
        }

        // Almoxarifado
        if (almoxCritico.length > 0) {
            reply += `⚠️ **Estoque:** ${almoxCritico.length} item(s) abaixo do mínimo\n`;
        } else {
            reply += `✅ **Estoque:** Dentro do nível mínimo\n`;
        }

        // Checkout
        const hoje = new Date();
        const checkoutVencidos = checkout.filter((c: any) => c.expected_return_date && new Date(c.expected_return_date) < hoje);
        if (checkoutVencidos.length > 0) {
            reply += `📤 **Empréstimos:** ${checkoutVencidos.length} devolução(ões) em atraso\n`;
        } else if (checkout.length > 0) {
            reply += `📤 **Empréstimos:** ${checkout.length} ativo(s), sem atrasos\n`;
        }

        // Recomendação
        const problemas = chamados.length + ativos.length + almoxCritico.length + checkoutVencidos.length;
        reply += '\n';
        if (problemas === 0) {
            reply += `🏆 **Status Geral: OPERAÇÃO NOMINAL** — Ótimo trabalho! Aproveite para realizar atividades preventivas.`;
        } else if (problemas <= 3) {
            reply += `🟡 **Status Geral: ATENÇÃO** — Há ${problemas} ponto(s) que requerem ação. Priorize conforme urgência.`;
        } else {
            reply += `🔴 **Status Geral: ALTA DEMANDA** — ${problemas} itens requerem atenção. Priorize os críticos e comunique sua equipe.`;
        }

        return {
            category: 'Briefing',
            reply,
            actions: [
                { label: '🚨 Ver chamados urgentes', prompt: 'Quais chamados estão urgentes?' },
                { label: '⚠️ Estoque crítico', prompt: 'Qual o status do almoxarifado?' },
                { label: '📅 Planejar semana', prompt: 'Crie um plano de atividades para a semana' },
            ],
        };
    }

    // ── Fallback Geral ─────────────────────────────────────────────────────────
    return {
        category: 'Assistente',
        reply: `🤖 **Olá! Posso ajudar com:**\n\n• 🚨 **Chamados** — status, prioridades e triagem\n• 📦 **Almoxarifado** — verificar estoques e alertas\n• 🖥️ **Ativos** — equipamentos em manutenção\n• 📤 **Empréstimos** — controle de checkout\n• 📅 **Planejamento** — plano semanal de atividades\n• 📊 **Resumo** — briefing geral da operação\n• 🔋 **Nobreaks** — baterias e energia\n• 📡 **Rede** — troubleshooting e diagnóstico\n\nDigite sua pergunta ou use os atalhos abaixo!`,
        actions: [
            { label: '📊 Briefing do dia', prompt: 'Me dê um resumo geral da operação' },
            { label: '🚨 Chamados urgentes', prompt: 'Quais chamados estão urgentes?' },
            { label: '📅 Planejar semana', prompt: 'Crie um plano de atividades para a semana' },
            { label: '⚠️ Estoque crítico', prompt: 'Qual o status do almoxarifado?' },
        ],
    };
}

// ─────────────────────────────────────────────
// Handler da Rota
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
        }
        const response = await generateResponse(message);
        return NextResponse.json(response);
    } catch (error) {
        console.error('[CopilotAPI] Erro:', error);
        return NextResponse.json({
            reply: '⚠️ Ocorreu um erro ao processar sua mensagem. Tente novamente.',
            category: 'Erro',
        });
    }
}
