package com.projeto.academico.service;

import com.projeto.academico.dto.EstatisticasResponseDTO;
import com.projeto.academico.model.Atividade;
import com.projeto.academico.model.Prioridade;
import com.projeto.academico.model.StatusAtividade;
import com.projeto.academico.model.Usuario;
import com.projeto.academico.repository.AtividadeRepository;
import com.projeto.academico.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EstatisticasService {

    private final AtividadeRepository atividadeRepository;
    private final UsuarioRepository usuarioRepository;

    public EstatisticasService(AtividadeRepository atividadeRepository,
                               UsuarioRepository usuarioRepository) {
        this.atividadeRepository = atividadeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public EstatisticasResponseDTO buscar(String email) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        List<Atividade> atividades = atividadeRepository.findByUsuarioIdOrderByPrazoAscIdAsc(usuario.getId());

        EstatisticasResponseDTO.Totais totais = new EstatisticasResponseDTO.Totais(
                atividades.size(), contarStatus(atividades, StatusAtividade.PENDENTE),
                contarStatus(atividades, StatusAtividade.EM_ANDAMENTO),
                contarStatus(atividades, StatusAtividade.CONCLUIDA));

        Map<Prioridade, Long> porPrioridade = new LinkedHashMap<>();
        for (Prioridade prioridade : new Prioridade[]{Prioridade.ALTA, Prioridade.MEDIA, Prioridade.BAIXA}) {
            porPrioridade.put(prioridade, atividades.stream()
                    .filter(a -> a.getPrioridade() == prioridade).count());
        }

        Map<Long, List<Atividade>> grupos = atividades.stream()
                .collect(Collectors.groupingBy(a -> a.getMateria().getId()));

        List<EstatisticasResponseDTO.PorMateria> porMateria = grupos.values().stream()
                .map(grupo -> new EstatisticasResponseDTO.PorMateria(
                        grupo.get(0).getMateria().getId(),
                        grupo.get(0).getMateria().getNome(),
                        grupo.size(),
                        contarStatus(grupo, StatusAtividade.PENDENTE),
                        contarStatus(grupo, StatusAtividade.EM_ANDAMENTO),
                        contarStatus(grupo, StatusAtividade.CONCLUIDA)))
                .sorted(Comparator.comparing(EstatisticasResponseDTO.PorMateria::materia,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new EstatisticasResponseDTO(totais, porPrioridade, porMateria);
    }

    private long contarStatus(List<Atividade> atividades, StatusAtividade situacao) {
        return atividades.stream().filter(a -> a.getStatus() == situacao).count();
    }
}
