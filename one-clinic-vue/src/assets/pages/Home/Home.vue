<script setup>
import './Home.css'

import {
  Button,
  Divider,
  features,
  benefits
} from './Home.js'
</script>

<template>
  <div class="app">

    <header class="header">
      <div class="container header-content">

        <div class="logo">
          <img src="https://asfldefzwlocpuszoedj.supabase.co/storage/v1/object/public/LOGO/ONE%20CLINIC%20-%20LOGO%20-%20PNG.png" alt="One Clinic Logo" class="logo-img-main" />

          <span class="logo-text">
            <span class="logo-one">ONE</span>
            <span class="logo-clinic">clinic</span>
          </span>
        </div>

        <nav class="nav-desktop">
          <a href="#recursos" class="nav-link">Recursos</a>
          <a href="#beneficios" class="nav-link">Benefícios</a>
          <a href="#contato" class="nav-link">Contato</a>
        </nav>

        <div class="header-actions">
          <Button label="Entrar" text class="btn-text"/>
          <Button label="Começar Grátis" class="btn-primary"/>
        </div>

      </div>
    </header>

    <section class="hero">
      <div class="hero-bg">
        <div class="hero-circle hero-circle-1"></div>
        <div class="hero-circle hero-circle-2"></div>
      </div>

      <div class="container hero-content">

        <span class="hero-tag">Novo</span>

        <h1 class="hero-title">
          Gestão completa para sua
          <span class="hero-highlight">
            clínica de estética
          </span>
        </h1>

        <p class="hero-description">
          Simplifique o dia a dia da sua clínica com agendamentos inteligentes,
          controle financeiro, gestão de clientes e muito mais.
        </p>

        <div class="hero-actions">
          <Button
            label="Começar Teste Grátis"
            class="btn-primary btn-large"
          />

          <Button
            label="Ver Demonstração"
            outlined
            class="btn-outline btn-large"
          />
        </div>

        <div class="hero-stats">

          <div class="stat">
            <span class="stat-value">500+</span>
            <span class="stat-label">Clínicas ativas</span>
          </div>

          <div class="stat-divider"></div>

          <div class="stat">
            <span class="stat-value">50k+</span>
            <span class="stat-label">Agendamentos/mês</span>
          </div>

          <div class="stat-divider"></div>

          <div class="stat">
            <span class="stat-value">98%</span>
            <span class="stat-label">Satisfação</span>
          </div>

        </div>
      </div>
    </section>

    <section id="recursos" class="features">

      <div class="container">

        <div class="section-header">
          <span class="section-tag">Recursos</span>

          <h2 class="section-title">
            Tudo que sua clínica precisa
          </h2>

          <p class="section-description">
            Ferramentas completas para gerenciar todos os aspectos do seu negócio.
          </p>
        </div>

        <div class="features-grid">

          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >

            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>

            <h3 class="feature-title">
              {{ feature.title }}
            </h3>

            <p class="feature-description">
              {{ feature.description }}
            </p>

          </div>

        </div>
      </div>
    </section>

    <section id="beneficios" class="benefits">

      <div class="container benefits-content">

        <div class="benefits-text">

          <span class="section-tag">
            Benefícios
          </span>

          <h2 class="section-title">
            Por que escolher a OneClinic?
          </h2>

          <div class="benefits-list">

            <div
              v-for="benefit in benefits"
              :key="benefit.title"
              class="benefit-item"
            >

              <div class="benefit-check">
                <i class="pi pi-check"></i>
              </div>

              <div>
                <h4 class="benefit-title">
                  {{ benefit.title }}
                </h4>

                <p class="benefit-description">
                  {{ benefit.description }}
                </p>
              </div>

            </div>

          </div>
        </div>

        <div class="benefits-visual">

          <div class="visual-card">

            <div class="visual-header">
              <span class="visual-dot"></span>
              <span class="visual-dot"></span>
              <span class="visual-dot"></span>
            </div>

            <div class="visual-content">

              <div class="visual-stat">
                <i class="pi pi-chart-line"></i>

                <div>
                  <span class="visual-stat-value">+127%</span>
                  <span class="visual-stat-label">Produtividade</span>
                </div>
              </div>

              <div class="visual-divider"></div>

              <div class="visual-stat">
                <i class="pi pi-clock"></i>

                <div>
                  <span class="visual-stat-value">-45%</span>
                  <span class="visual-stat-label">Tempo em tarefas</span>
                </div>
              </div>

              <div class="visual-divider"></div>

              <div class="visual-stat">
                <i class="pi pi-heart"></i>

                <div>
                  <span class="visual-stat-value">+89%</span>
                  <span class="visual-stat-label">Satisfação cliente</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

    <section class="cta">

      <div class="container cta-content">

        <h2 class="cta-title">
          Pronto para transformar sua clínica?
        </h2>

        <p class="cta-description">
          Comece seu teste gratuito de 14 dias.
        </p>

        <div class="cta-actions">

          <Button
            label="Começar Agora"
            class="btn-cta btn-large"
          />

          <Button
            label="Falar com Consultor"
            text
            class="btn-cta-text btn-large"
          />

        </div>

      </div>

    </section>

    <footer class="footer" id="contato">

      <div class="container footer-content">

        <div class="footer-brand">

          <div class="logo">

            <img src="https://asfldefzwlocpuszoedj.supabase.co/storage/v1/object/public/LOGO/ONE%20CLINIC%20-%20LOGO%20-%20PNG.png" alt="One Clinic Logo" class="logo-img-footer" />

            <span class="logo-text">
              <span class="logo-one footer-logo-one">ONE</span>
              <span class="logo-clinic footer-logo-clinic">clinic</span>
            </span>

          </div>

          <p class="footer-tagline">
            Gestão inteligente para clínicas de estética
          </p>

        </div>

        <div class="footer-links">

          <div class="footer-column">
            <h4>Produto</h4>
            <a href="#">Recursos</a>
            <a href="#">Preços</a>
            <a href="#">Integrações</a>
          </div>

          <div class="footer-column">
            <h4>Empresa</h4>
            <a href="#">Sobre</a>
            <a href="#">Blog</a>
            <a href="#">Carreiras</a>
          </div>

          <div class="footer-column">
            <h4>Suporte</h4>
            <a href="#">Central de Ajuda</a>
            <a href="#">Contato</a>
            <a href="#">Status</a>
          </div>

        </div>

      </div>

      <div class="footer-divider"></div>

      <div class="container footer-bottom">

        <p>
          © 2026 OneClinic. Todos os direitos reservados.
        </p>

        <div class="footer-legal">
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
        </div>

      </div>

    </footer>

  </div>
</template>